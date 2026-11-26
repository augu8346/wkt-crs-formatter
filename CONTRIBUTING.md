# Contributing

Use Node.js 24 LTS or newer with npm. From the repository root:

```sh
npm ci
npm test
npm run package
```

The last command creates a versioned VSIX in the repository root. There are no runtime dependencies. To try an edit without installing the package, run `code --extensionDevelopmentPath="ABSOLUTE_PATH_TO_THIS_REPO"` and open an untitled document in the development window.

For formatter changes, add a small input and expected output under `test/`. Check that formatting the result again leaves it unchanged. Use synthetic examples rather than private projection files. For editor changes, also check **Format Document** on a WKT file and the **WKT: Format Coordinate Reference System** command on a selection in plain text.

## Release checklist

1. Update the package version, lockfile, and changelog. Run the tests and package the VSIX.
2. Inspect `npx --no-install vsce ls --no-dependencies`; only the intended release files should ship. Install the VSIX in a clean VS Code profile and check the workflows above.
3. For a source release, tag the tested commit and attach the VSIX to the release on the chosen Git host.
4. **Future Marketplace release only:** create a [Marketplace publisher](https://code.visualstudio.com/api/working-with-extensions/publishing-extension), replace `local-preview` in `package.json` with the real publisher ID, and add the public source repository URL. Rebuild, verify, and publish the tested VSIX using `npx --no-install vsce publish --packagePath <path-to-vsix>` with authorized publisher credentials. Never commit a token. The new publisher ID changes the extension ID; uninstall the local preview before installing the Marketplace version.
