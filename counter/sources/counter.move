/* Module: counter::counter

This module provides a simple on-chain counter resource with the following functionality:
- Creation of a new Counter resource, initialized to zero, and transferred to the sender.
- Incrementing the value of an existing Counter resource.
- Retrieving the current value of a Counter resource.

The Counter resource is uniquely identified by a UID and stores a single u64 value.
*/
module counter::counter;


/*
 A simple on-chain counter module.
 
 Provides a Counter resource with the following functions:
 - `create_counter`: Creates and transfers a new Counter resource to the sender.
 - `increment`: Increments the value of an existing Counter resource.
 - `get_value`: Returns the current value of a Counter resource.
*/
public struct Counter has key {
	id: UID,
	value: u64,
}


/*
Creates a new Counter resource with value 0 and transfers it to the sender.

Arguments:
- `ctx`: Mutable reference to the transaction context.
*/
public fun create_counter(ctx: &mut TxContext) {
	let counter = Counter {
		id: object::new(ctx),
		value: 0,
	};

	transfer::transfer(counter, tx_context::sender(ctx));
}


/*
Increments the value of the given Counter resource by 1.

Arguments:
- `counter`: Mutable reference to a Counter resource.
*/
public fun increment(counter: &mut Counter) {
	counter.value = counter.value + 1;
}


/*
Returns the current value of the given Counter resource.

Arguments:
- `counter`: Reference to a Counter resource.

Returns:
- `u64`: The current value of the counter.
*/
public fun get_value(counter: &Counter): u64 {
	counter.value
}

