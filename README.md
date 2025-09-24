# Organize Cargo.toml

[![CI](https://github.com/ryanguild/organize-cargo-toml/actions/workflows/ci.yml/badge.svg)](https://github.com/ryanguild/organize-cargo-toml/actions/workflows/ci.yml)
[![Release](https://github.com/ryanguild/organize-cargo-toml/actions/workflows/release.yml/badge.svg)](https://github.com/ryanguild/organize-cargo-toml/actions/workflows/release.yml)
[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/dev-layer.organize-cargo-toml)](https://marketplace.visualstudio.com/items?itemName=dev-layer.organize-cargo-toml)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/dev-layer.organize-cargo-toml)](https://marketplace.visualstudio.com/items?itemName=dev-layer.organize-cargo-toml)

A VSCode extension to organize and format Cargo.toml files in Rust projects by sorting all dictionary levels alphabetically.

## Features

- **Alphabetical Organization**: Sorts all sections and keys alphabetically within each dictionary level
- **Package Section Priority**: The `[package]` section is always hoisted to the top of the file
- **Inline Code Lens**: Shows a clickable "🗂️ Organize Cargo.toml" link at the top of Cargo.toml files
- **Context Menu Integration**: Right-click on Cargo.toml files to access organization commands
- **Comment Preservation**: Optionally preserve comments during organization

## How It Works

The extension parses your Cargo.toml file and:

1. **Hoists `[package]` section** to the very top (if present)
2. **Sorts all other sections** alphabetically (e.g., `[build-dependencies]`, `[dependencies]`, `[dev-dependencies]`, `[features]`, etc.)
3. **Sorts keys within each section** alphabetically (e.g., within `[dependencies]`: `anyhow`, `clap`, `serde`, etc.)
4. **Sorts nested dictionary keys** alphabetically (e.g., in `{ version = "1.0", features = ["full"] }`)

## Commands

- `Cargo: Organize Cargo.toml` - Organizes the entire Cargo.toml file with alphabetical sorting

## Configuration

- `organize-cargo-toml.preserveComments`: Preserve comments when organizing (default: true)

## Example

**Before organizing:**
```toml
version = "0.1.0"
name = "my-project"
edition = "2021"

[dependencies]
serde_json = "1.0"
clap = { version = "4.0", features = ["derive"] }
anyhow = "1.0"

[dev-dependencies]
tokio = "1.0"
```

**After organizing:**
```toml
[package]
edition = "2021"
name = "my-project"
version = "0.1.0"

[dependencies]
anyhow = "1.0"
clap = { features = ["derive"], version = "4.0" }
serde_json = "1.0"

[dev-dependencies]
tokio = "1.0"
```

## Usage

1. Open a Cargo.toml file
2. **Click the inline link**: Look for the "🗂️ Organize Cargo.toml" link at the top of the file and click it
3. **Use command palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and run "Cargo: Organize Cargo.toml"
4. **Right-click menu**: Right-click in the editor or on the file in the explorer and select "Organize Cargo.toml"

## Requirements

- VSCode 1.87.0 or higher

## Development

### Setup
```bash
git clone https://github.com/ryanguild/organize-cargo-toml.git
cd organize-cargo-toml
npm install
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Running the Extension
1. Open the project in VSCode
2. Press `F5` to launch the Extension Development Host
3. Open a Cargo.toml file in the new window to test the extension

### Packaging
```bash
npm run package
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag v1.0.0`
4. Push the tag: `git push origin v1.0.0`
5. GitHub Actions will automatically build, test, and publish to VS Code Marketplace

## License

ISC
