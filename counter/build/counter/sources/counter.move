module counter::counter;


public struct Counter has key {
	id: UID,
	value: u64,
}

public fun create_counter(ctx: &mut TxContext) {
	let counter = Counter {
		id: object::new(ctx),
		value: 0,
	};

	transfer::transfer(counter, tx_context::sender(ctx));
}

public fun increment(counter: &mut Counter) {
	counter.value = counter.value + 1;
}

public fun get_value(counter: &Counter): u64 {
	counter.value
}

