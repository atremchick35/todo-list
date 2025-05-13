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

