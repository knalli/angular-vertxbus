const fs = require('fs');
const path = require('path');

const AdmZip = require('adm-zip');
const TarGz = require('tar.gz');
const publishRelease = require('publish-release');
const rimraf = require('rimraf');

// helper
const mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code != 'EEXIST') {
      throw e;
    }
  }
}

// Find changelog for a specific version
const getChangelog = (changelogFilePath, forVersion) => {
  const prefix = '# ';
  return new Promise((resolve) => {
    fs.readFile(changelogFilePath, (err, bytes) => {
      if (err) {
        console.log('Changelog file "' + changelogFilePath + '" not found!');
        resolve({header : forVersion, body : ''});
      } else {
        let content = bytes.toString();
        let lines = content.split('\n');
        let bodyStartIndex = lines.findIndex((str) => str.substr(0, prefix.length + forVersion.length) === `${prefix}${forVersion}`);
        if (bodyStartIndex > -1) {
          let bodyEndIndex = lines.findIndex((str, idx) => idx > bodyStartIndex && str.substr(0, prefix.length) === prefix);
          let header = lines[bodyStartIndex].substring(prefix.length);
          let body = lines.slice(bodyStartIndex + 1, bodyEndIndex).join('\n');
          resolve({header, body});
        } else {
          resolve({header : forVersion, body : ''});
        }
      }
    });
  });
};

// Build archive type .zip
// FIXME: fix handling of sub directory
const buildZipArchive = ({lookupDir, archiveFilePath}) => {
  return new Promise((resolve, reject) => {
    fs.readdir(lookupDir, (err, files) => {
      if (err) {
        reject();
      } else {
        let archive = new AdmZip();
        files.forEach(file => {
          let localFilename = path.join(lookupDir, file);
          archive.addLocalFile(localFilename);
        });
        archive.writeZip(archiveFilePath);
        resolve(archiveFilePath);
      }
    });
  });
};

// Build archive type .tar.gz
const buildTarGzArchive = ({lookupDir, archiveFilePath}) => {
  let gzipOptions = {
    level : 9,
    memLevel : 9,
  };
  let tarOptions = {
    fromBase : true
  };
  return new TarGz(gzipOptions, tarOptions)
    .compress(lookupDir, archiveFilePath)
    .then(() => archiveFilePath);
};

// Upload and apply release
const publish = ({ghApiToken, projectVersion, projectVersionName, projectOwner, projectRepo, changelog, assets}) => {
  return new Promise((resolve, reject) => {
    publishRelease({
      token : ghApiToken,
      owner : projectOwner,
      repo : projectRepo,
      tag : projectVersion,
      name : projectVersionName,
      notes : changelog.body,
      draft : false,
      prerelease : false,
      reuseRelease : true,
      reuseDraftOnly : true,
      assets : assets,
    }, function (err, release) {
      if (err) {
        reject(err);
      } else {
        resolve(release);
      }
    })
  });
};

// Main
// Load repo details
const pkg = require('./../package.json');

if (!process.env.GH_TOKEN) {
  console.log('Missing env key GH_TOKEN');
  process.exit(1);
}
//if (!process.env.PROJECT_OWNER) {
//  console.log('Missing env key PROJECT_OWNER');
//  process.exit(1);
//}

console.log(`Get changelog for version ${pkg.version}...`);
const changelogFilePath = path.normalize(path.join(__dirname, '../CHANGELOG.md'));
const distDir = path.normalize(path.join(__dirname, '..', 'dist'));
const tempDir = path.normalize(path.join(__dirname, '..', 'temp'));
const tempAssetsDir = path.normalize(path.join(__dirname, '..', 'temp', 'assets'));

// ensure temp structure
const resetTempResources = () => {
  return new Promise((resolve) => {
    if (fs.existsSync(tempAssetsDir)) {
      // delete only
      rimraf(tempAssetsDir, () => {
        mkdirSync(tempAssetsDir);
        resolve();
      });
    } else {
      mkdirSync(tempDir);
      mkdirSync(tempAssetsDir);
      resolve();
    }
  });
};

// get changelog and get fresh archives
const bundle = () => {
  return Promise.all([
    getChangelog(changelogFilePath, pkg.version),
    Promise.all([
      buildZipArchive({lookupDir : distDir, archiveFilePath : `${tempAssetsDir}/${pkg.name}-${pkg.version}.zip`}),
      buildTarGzArchive({lookupDir : distDir, archiveFilePath : `${tempAssetsDir}/${pkg.name}-${pkg.version}.tar.gz`}),
    ])
  ]);
};

resetTempResources()
  .then(bundle)
  .then(([changelog, assets]) => {
    return publish({
      ghApiToken : process.env.GH_TOKEN,
      projectOwner : 'angular-translate',
      projectRepo : process.env.PROJECT_REPO || pkg.name,
      projectVersion : pkg.version,
      projectVersionName : `${pkg.name} ${changelog.header || pkg.version}`,
      changelog : changelog,
      assets : assets,
    });
  })
  .then(() => {
    console.log('Release published successfully');
    process.exit(0)
  })
  .catch((err) => {
    console.log('Failed: ' + err);
    process.exit(1);
  });
