function createElement(tag, attributes, children, events) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      if (attributes[key] !== null) {
        element.setAttribute(key, attributes[key]);
      }
    });
  }

  if (events) {
    Object.keys(events).forEach((eventName) => {
      element.addEventListener(eventName, events[eventName]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  return element;
}

class Component {
  constructor() {
    this._domNode = null;
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }

  update() {
    const newDomNode = this.render();
    this._domNode.replaceWith(newDomNode);
    this._domNode = newDomNode;
  }
}

class AddTask extends Component {
  constructor(onAddTask, onInputChange, text) {
    super();
    this.onAddTask = onAddTask;
    this.onInputChange = onInputChange;
    this.text = text;
  }

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement("input", {
        type: "text",
        placeholder: "Задание",
        value: this.text
      }, null, {
        input: this.onInputChange
      }),
      createElement("button", {}, "+", {
        click: this.onAddTask
      })
    ]);
  }
}

class Task extends Component {
  constructor(task, onToggle, onDelete) {
    super();
    this.task = task;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.state = { confirmDelete: false }; // Защита от случайного удаления
  }

  render() {
    return createElement("li", {}, [
      createElement("input", {
        type: "checkbox",
        checked: this.task.completed ? "checked" : null
      }, null, {
        change: this.onToggle
      }),
      createElement("label", {
        style: `color: ${this.task.completed ? "gray" : (this.state.confirmDelete ? "red" : "black")}` // Меняем цвет текста задачи
      }, this.task.text),
      createElement("button", {
        style: `color: ${this.state.confirmDelete ? "red" : "black"}` // Кнопка тоже становится красной при первом нажатии
      }, "🗑️", {
        click: () => {
          if (this.state.confirmDelete) {
            this.onDelete(); // Второе нажатие — удалить
          } else {
            this.state.confirmDelete = true; // Первое нажатие — меняем цвет
            this.update();
          }
        }
      })
    ]);
  }
}



class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      tasks: [],
      newTaskText: ""
    };
    this.taskComponents = {};
    this.loadStateFromLocalStorage();
  }

  onAddInputChange = (e) => {
    this.state.newTaskText = e.target.value;
  };

  onAddTask = () => {
    const text = this.state.newTaskText.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      text,
      completed: false
    };

    this.state.tasks.push(newTask);
    this.state.newTaskText = "";
    this.update();
    this.saveStateToLocalStorage();
  };

  saveStateToLocalStorage() {
    localStorage.setItem("todo-state", JSON.stringify(this.state));
  }

  loadStateFromLocalStorage() {
    const saved = localStorage.getItem("todo-state");
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch {
        this.state = { tasks: [], newTaskText: "" };
      }
    }
  }

  render() {
    const addTask = new AddTask(this.onAddTask, this.onAddInputChange, this.state.newTaskText);

    // Создание и обновление Task-компонентов
    this.state.tasks.forEach((task) => {
      if (!this.taskComponents[task.id]) {
        this.taskComponents[task.id] = new Task(
            task,
            () => {
              task.completed = !task.completed;
              this.update();
              this.saveStateToLocalStorage();
            },
            () => {
              this.state.tasks = this.state.tasks.filter(t => t.id !== task.id);
              delete this.taskComponents[task.id];
              this.update();
              this.saveStateToLocalStorage();
            }
        );
      } else {
        this.taskComponents[task.id].task = task;
      }
    });

    // Удаляем устаревшие компоненты
    Object.keys(this.taskComponents).forEach(id => {
      if (!this.state.tasks.find(t => t.id == id)) {
        delete this.taskComponents[id];
      }
    });

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      addTask.getDomNode(),
      createElement("ul", {}, this.state.tasks.map(task =>
          this.taskComponents[task.id].getDomNode()
      ))
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
