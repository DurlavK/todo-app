import ToDoList from './todolist.js';
import ToDoItem from './todoitem.js';

const todolist = new ToDoList();

//launch app
document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "complete") {
        initApp();
    }
});

const initApp = () => {
    //add listeners
    const itemEntryForm = document.getElementById('itemEntryForm');
    itemEntryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
    });
    const clearItems = document.getElementById("clearItems");
    clearItems.addEventListener("click", (event) => {
        const list = todolist.getList();
        if (list.length) {
            const confirmed = confirm("are you sure to clear entire list?");
            if (confirmed) {
                todolist.clearList();
                // update persistent data
                updatePersistentData(todolist.getList());
                refreshThePage();
            }
        }
    });
    //procedural things
    loadListObject();
    refreshThePage();
};

const loadListObject = () => {
    const storedList = localStorage.getItem("myToDoList");
    if (typeof storedList !== "string") return;
    const parsedList = JSON.parse(storedList);
    parsedList.forEach(itemObj => {
        const newToDoItem = createNewItem(itemObj._id, itemObj._item);
        todolist.addItemTodoList(newToDoItem);
    })
};

const refreshThePage = () => {
    clearlistDisplay();
    renderList();
    clearItemEntryField();
    setFocusOnItemEntry();
};

const clearlistDisplay = () => {
    const parentElement = document.getElementById('listItems');
    deleteContents(parentElement);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};

const renderList = () => {
    const list = todolist.getList();
    list.forEach(item => {
        buildListItem(item);
    })
};

const buildListItem = (item) => {
    const div = document.createElement("div");
    div.className = "item";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = item.getId();
    check.tabIndex = 0;
    addClickListenerToCheckbox(check);
    const label = document.createElement("label");
    label.htmlFor = item.getId();
    label.textContent = item.getItem();
    div.appendChild(check);
    div.appendChild(label);
    const container = document.getElementById("listItems");
    container.appendChild(div);
};

const addClickListenerToCheckbox = (checkbox) => {
    checkbox.addEventListener("click", (event) => {
        todolist.removeItemFromList(checkbox.id);
        //remove from persistent data
        updatePersistentData(todolist.getList());
        const removedText = getLabelText(checkbox.id);
        updateScreenReaderConfirmation(removedText, "removed from list");
        setTimeout(() => {
            refreshThePage();
        }, 1000)
    });
};

const getLabelText = (checkboxId) => {
    return document.getElementById(checkboxId).nextElementSibling.textContent;
};

const updatePersistentData = (listArray) => {
    localStorage.setItem("myToDoList", JSON.stringify(listArray));
};

const clearItemEntryField = () => {
    document.getElementById("newItem").value = "";
};

const setFocusOnItemEntry = () => {
    document.getElementById('newItem').focus();
};

const processSubmission = () => {
    const newEntryText = getNewEntry();
    if (!newEntryText.length) return;
    const nextItemId = calcNextItemId();
    const todoItem = createNewItem(nextItemId, newEntryText);
    todolist.addItemTodoList(todoItem);
    //update persistent data
    updatePersistentData(todolist.getList());
    updateScreenReaderConfirmation(newEntryText, "added");
    refreshThePage();
};

const getNewEntry = () => {
    return document.getElementById("newItem").value.trim();
};

const calcNextItemId = () => {
    let nextItemId = 1;
    const list = todolist.getList();
    if (list.length > 0) {
        nextItemId = list[list.length -1].getId() +1;
    }
    return nextItemId;
};

const createNewItem = (itemId, itemText) => {
    const todo = new ToDoItem();
    todo.setId(itemId);
    todo.setItem(itemText);
    return todo;
};

const updateScreenReaderConfirmation = (newEntryText, actionVerb) => {
    document.getElementById("confirmation").textContent = `${newEntryText} ${actionVerb}.`;
}