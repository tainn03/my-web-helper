# GitHub Actions Workflows

This repository uses GitHub Actions to automate the release process for the My Web Helper Chrome Extension.

## Workflows

### 1. Create Tag on Master Merge (`create-tag.yml`)

**Trigger**: Push to `master` or `main` branch

**What it does**:
- Automatically creates a new Git tag when code is merged into the master branch
- Uses the version number from `package.json`
- Creates a GitHub release with the tag
- Only creates the tag/release if it doesn't already exist

**Benefits**:
- Automatic versioning based on package.json
- Consistent release tagging
- No manual tag creation needed

### 2. Build and Release ZIP (`release-zip.yml`)

**Trigger**: When a GitHub release is published

**What it does**:
- Builds the Chrome extension
- Creates the extension ZIP file
- Creates a source code ZIP file
- Uploads both ZIP files to the GitHub release

**Benefits**:
- Automated build process
- Consistent ZIP file naming
- Source code availability for transparency
- Ready-to-install extension packages

## Usage

### For Developers
1. Make changes to your code
2. Update version in `package.json` when ready for release
3. Merge changes into `master` branch
4. A tag and release will be automatically created
5. Publish the release to trigger ZIP creation

### For Users
- Download the extension ZIP from GitHub releases
- Install manually in Chrome: `chrome://extensions/` → "Load unpacked" → Select the extracted folder

## File Structure
```
.github/
  workflows/
    create-tag.yml      # Auto-tag on master merge
    release-zip.yml     # Build ZIPs on release
```

## Requirements
- Node.js 20+
- npm
- Git repository with master/main branch
- package.json with version field