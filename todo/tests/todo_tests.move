#[test_only]
module todo::todo_list_tests;

use std::string;
use sui::test_scenario;
use todo::todo::{Self, TodoList};


#[test]
fun test_create_todolist() {
    let user = @0xCa;
    let mut scenario = test_scenario::begin(user);

    {
        let ctx = scenario.ctx();
        let list = todo::new(ctx, string::utf8(b"Test"));
        transfer::public_share_object(list);
    };

    scenario.next_tx(user);
    {
        let list = test_scenario::take_shared<TodoList>(&scenario);

        assert!(todo::length(&list) == 0, 0);
        assert!(list.name() == b"Test".to_string(), 1);

        test_scenario::return_shared(list);
    };

    scenario.end();
}

#[test]
fun add_item_to_todo() {
    let user = @0xCa;
    let item = string::utf8(b"Item1");
    let mut scenario = test_scenario::begin(user);

    {
        let ctx = scenario.ctx();
        let list = todo::new(ctx, string::utf8(b"Test"));
        transfer::public_share_object(list);
    };

    scenario.next_tx(user);
    {
        let mut list = test_scenario::take_shared<TodoList>(&scenario);
        todo::add(&mut list, item);
        assert!(todo::length(&list) == 1, 0);
        test_scenario::return_shared(list);
    };

    scenario.end();
}

#[test]
fun remove_item_from_todo() {
    let user = @0xCa;
    let item1 = string::utf8(b"Item1");
    let item2 = string::utf8(b"Item2");
    let item3 = string::utf8(b"Item3");

    let mut scenario = test_scenario::begin(user);

    {
        let ctx = scenario.ctx();
        let list = todo::new(ctx, string::utf8(b"Test"));
        transfer::public_share_object(list);
    };

    scenario.next_tx(user);
    {
        let mut list = test_scenario::take_shared<TodoList>(&scenario);
        todo::add(&mut list, item1);
        todo::add(&mut list, item2);
        todo::add(&mut list, item3);
        assert!(todo::length(&list) == 3, 0);
        test_scenario::return_shared(list);
    };

    scenario.next_tx(user);
    {
        let mut list = test_scenario::take_shared<TodoList>(&scenario);
        todo::remove(&mut list, 0);

        assert!(todo::length(&list)==2, 0);

        test_scenario::return_shared(list);
    };

    scenario.end();
}