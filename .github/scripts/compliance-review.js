const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

const API_URL = 'https://9vtm5bda87.execute-api.eu-central-1.amazonaws.com/chat-poll';
const GRANT_SECRET = process.env.GRANT_SECRET;

async function getRepositoryContent(includeFolders) {
  let content = '';

  function readFilesRecursively(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        readFilesRecursively(filePath);
      } else {
        content += fs.readFileSync(filePath, 'utf8') + '\n';
      }
    }
  }

  for (const folder of includeFolders) {
    readFilesRecursively(folder);
  }

  return content;
}

async function sendComplianceReview(content) {
  const response = await axios.post(API_URL, {
    message: content,
    context_id: null
  }, {
    headers: {
      'Authorization': `Bearer ${GRANT_SECRET}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.context_id;
}

async function pollComplianceResult(contextId) {
  while (true) {
    const response = await axios.post(API_URL, {
      message: 'Done?',
      context_id: contextId
    }, {
      headers: {
        'Authorization': `Bearer ${GRANT_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(JSON.stringify(response.data));

    if (response.data["response"].startsWith('Not yet.') === false) {
      return response.data.response;
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

async function createGitHubIssue(title, body) {
  const octokit = new (require('@octokit/rest'))();
  await octokit.issues.create({
    owner: process.env.GITHUB_REPOSITORY.split('/')[0],
    repo: process.env.GITHUB_REPOSITORY.split('/')[1],
    title: title,
    body: body
  });
}

async function main() {
  console.log('Compliance review started');
  try {
    const includeFolders = ['terraform']; // Specify the folders you want to include
    const repoContent = await getRepositoryContent(includeFolders);
    console.log('Repository content retrieved');

    const contextId = await sendComplianceReview(repoContent);
    console.log(`Compliance review initiated. Context ID: ${contextId}`);

    const finalResult = await pollComplianceResult(contextId);
    console.log(`Final result: ${finalResult}`);

    if (finalResult.startsWith('Your request is already fully compliant')) {
      return { status: 'pass', message: finalResult };
    } else {
      return { status: 'fail', message: finalResult };
    }
  } catch (error) {
    console.error('Error during compliance review:', error);
    return { status: 'error', message: error.message };
  }
}

function addCheckboxToSteps(inputString) {
  // Use a regular expression to find each step indicator and add the checkbox
  const updatedString = inputString.replace(/(?=\*\*\d+\.\*\*\s)/g, '- [ ] ');
  return updatedString;
}

main()
  .then(result => {
    // Log result in a format GitHub Actions can capture
    const rawMessage = addCheckboxToSteps(result.message);
    console.log(rawMessage);
    const message = btoa(rawMessage);
    console.log(message);
    console.log(`::set-output name=status::${result.status}`);
    console.log(`::set-output name=message::${message}`);

    // let escapedMessage = result.message
    //   .replace(/%/g, '%25')    // Escape %
    //   .replace(/\n/g, '%0A')   // Escape newlines
    //   .replace(/\r/g, '%0D');  // Escape carriage returns

    // Use the ::set-output command for both status and the escaped message
    // console.log(`::set-output name=status::${result.status}`);
    // console.log(`::set-output name=message::${escapedMessage}`);
    // fs.writeFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}`);
    // fs.writeFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}`);

  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
