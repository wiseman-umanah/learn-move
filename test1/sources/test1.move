/// The module `hello_world` under named address `hello_world`.
/// The named address is set in the `Move.toml`.
module test1::test1;

// Imports the `String` type from the Standard Library
use std::string::String;

/// Returns the "Hello, World!" as a `String`.
public fun hello_world(): String {
    b"Hello, World!".to_string()
}
