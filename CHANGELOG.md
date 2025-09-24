# Changelog

All notable changes to the "organize-cargo-toml" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Inline Code Lens**: Added clickable "🗂️ Organize Cargo.toml" link at the top of Cargo.toml files for easy access

### Changed
- **Removed Format Provider**: No longer registers as a document formatter to avoid conflicts with other TOML formatters
- Users now have explicit control over when to organize their Cargo.toml files
- Improved user experience with clear, visible inline action link

### Removed
- Document formatting provider integration (no longer triggers on `Shift+Alt+F`)

## [0.1.0] - 2024-09-24

### Added
- Initial release of Organize Cargo.toml extension
- Alphabetical organization of Cargo.toml sections and keys
- Package section priority (always hoisted to top)
- Comment preservation during organization
- Format provider integration with VSCode's format document command
- Context menu integration for Cargo.toml files
- Configuration option to preserve comments
- Comprehensive test suite with Jest
- Support for complex dependency values sorting

### Features
- Organizes all sections alphabetically except `[package]` which stays at top
- Sorts keys within each section alphabetically
- Sorts complex dependency objects (e.g., `{ version = "1.0", features = ["derive"] }`)
- Preserves comments and associates them with relevant sections
- Works with VSCode's built-in format document command (`Shift+Alt+F`)
- Right-click context menu for easy access
- Configurable comment preservation

[Unreleased]: https://github.com/ryanguild/organize-cargo-toml/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ryanguild/organize-cargo-toml/releases/tag/v0.1.0
