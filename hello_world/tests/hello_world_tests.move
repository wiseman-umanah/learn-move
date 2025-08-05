/*
#[test_only]
module hello_world::hello_world_test;
// uncomment this line to import the module
use hello_world::hello_world;

const ENotImplemented: u64 = 0;

#[test]
fun test_hello_world() {
    assert hello_world::hello_world() == b"Hello, world!".to_string()
}

#[test, expected_failure(abort_code = ::hello_world::hello_world_tests::ENotImplemented)]
fun test_hello_world_fail() {
    abort ENotImplemented
}
*/
