import test, { expect, Page } from "@playwright/test";

const todos = ["Cleaning the sword", "Changing life", "Becoming Mario Bros"];


test.beforeEach(async ({page}) => {
    page.goto("/")
})

test.describe("Adding todos", () => {
    test("Add todo by button", async ({page}) => {
            const todoInput = page.getByPlaceholder("WRITE SOMETHING")
            const button = page.getByText("Add");
            await todoInput.fill(todos[0])
            await button.click()
            await expect(page.getByTestId("todo-test").locator("h3")).toHaveText(todos[0])
    
    })

    test("Add todo by enter", async ({page}) => {
            const todoInput = page.getByPlaceholder("WRITE SOMETHING")

            await todoInput.fill(todos[0])
            await todoInput.press("Enter")
            await expect(page.getByTestId("todo-test").locator("h3")).toHaveText(todos[0])
    })

    test("Adding multiple todos", async ({page}) => {
        const todoInput = page.getByPlaceholder("WRITE SOMETHING")
        for(const todo of todos){
            await todoInput.fill(todo)
            await todoInput.press("Enter")
        }

        await expect(page.getByTestId("todo-test").locator("h3")).toHaveText(todos)

    })
    test("Should avoid adding todo if input is empty", async ({page}) => {
        const todoInput = page.getByPlaceholder("WRITE SOMETHING")
        await todoInput.press("Enter")
        await expect(page.getByTestId("todo-test")).toBeHidden()
    }) 

    test("Input gets cleared after adding todo", async ({page}) => {
        const todoInput = page.getByPlaceholder("WRITE SOMETHING")
        await todoInput.fill(todos[0])
        await todoInput.press("Enter")
        
        await expect(todoInput).toBeEmpty();
    })

    test("should short todo if too long", async ({page}) => {

        const todoInput = page.getByPlaceholder("WRITE SOMETHING")
        const maxLength = await todoInput.getAttribute("maxLength");
        const limit = parseInt(maxLength || "0");
        await addTodo(page, "0".repeat(limit + 1))
        await expect(page.getByTestId("todo-test").locator("h3")).toHaveText("0".repeat(limit));
    })


    test("Random button should add three different todos", async ({page}) => {
        
        const randomButton = page.getByText("Random TODOS!");

        await randomButton.click();
        const response = await page.waitForResponse((res) => res.url().includes("/todos"));
        expect(response.status()).toBe(200);
        await expect(page.getByTestId("todo-test")).toHaveCount(3);
    })
})

test.describe("Deleting / clearing todos", () => {
    test("Deleting a single todo", async ({page}) => {
        await addTodo(page, todos[0])
        await expect(page.getByTestId("todo-test").locator("h3")).toHaveText(todos[0])
        const todo = page.getByTestId("todo-test");
        await todo.getByText("delete").click()
        await expect(todo).toBeHidden()
    })

    test("Clearing all todos", async ({page}) => {
        

        for(const todo of todos){
            await addTodo(page, todo)
        }
        await expect(page.getByTestId("todo-test").locator("h3")).toHaveText(todos)

        const clearButton = page.getByText("Clear All")

        await clearButton.click()

        await expect(page.getByTestId("todo-test")).toBeHidden()
    })
})

test.describe("Completing todos", () => {
   

    test("Should complete when pressing checkbox in todo", async ({page}) => {
        await addTodo(page, todos[0])
        const todo = page.getByTestId("todo-test");

        await todo.locator("[name=complete]").click();
        await expect(todo.locator("[name=complete]")).toBeChecked();
        await expect(todo.locator("h3")).toHaveClass(/line-through/);
    })

    test("Should uncomplete when pressing checkbox in completed todo", async ({page}) => {
        await addTodo(page, todos[0])
        const todo = page.getByTestId("todo-test");
        await todo.locator("[name=complete]").click();
        await expect(todo.locator("[name=complete]")).toBeChecked();
        await expect(todo.locator("h3")).toHaveClass(/line-through/);
        await todo.locator("[name=complete]").click();
        await expect(todo.locator("[name=complete]")).not.toBeChecked();
        await expect(todo.locator("h3")).not.toHaveClass(/line-through/)
    })
})

test.describe("Reorder todos", () => {
    test("Should reorder the todos if drag and dropped", async ({page}) => {
        await addTodo(page, todos[0]);
        await addTodo(page, todos[1]);
        await addTodo(page, todos[2]);

        const gripper = await page.getByTestId("todo-test").first().locator(".gripper");
        const gripperBox = await gripper.boundingBox();
        await page.mouse.move(gripperBox?.x|| 0, gripperBox?.y || 0)
        await gripper.dragTo(page.locator("li:last-of-type > .gripper"), {targetPosition: {x: 15, y: 15}})
        await page.waitForTimeout(200);
        await expect(page.locator("li:first-of-type > h3")).toHaveText(todos[2]);
        await expect(page.locator("li:last-of-type > h3")).toHaveText(todos[0]);
    })
})

async function addTodo(page:Page, todo: string){

    const todoInput = page.getByPlaceholder("WRITE SOMETHING")
    const button = page.getByText("Add");
    await todoInput.fill(todo)
    await button.click()

}