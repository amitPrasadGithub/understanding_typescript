enum ProjectStatus {
  Active,
  Finished,
}

// Project Class
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Listener
type Listener = (items: Project[]) => void;

// ProjectState
class ProjectState {
  private listeners: Listener[] = [];
  private static instance: ProjectState;
  projects: Project[] = [];
  private constructor() {}

  public static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  public addProjects(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.listeners.forEach((listenerFn) => {
      listenerFn(this.projects.slice());
    });
  }
}

// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length > validatableInput.minLength;
  }
  if (
    validatableInput.maxLength &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length < validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value > validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value < validatableInput.max;
  }
  return isValid;
}

// ProjectList
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  htmlElement: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    this.templateElement = document.querySelector(
      "#project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.querySelector("#app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.htmlElement = importedNode.firstElementChild as HTMLElement;
    this.htmlElement.id = `${this.type}-projects`;

    this.assignedProjects = [];

    projectState.addListener((projects: Project[]) => {
      const relavantProject = projects.filter(
          (project) => {
            if(this.type === 'active')
                return project.status === ProjectStatus.Active;
            return project.status === ProjectStatus.Finished;
          }
      );
      this.assignedProjects = relavantProject;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.querySelector(
      `#${this.type}-project-list`
    )! as HTMLUListElement;

    listEl.textContent = '';
    this.assignedProjects.forEach((project) => {
      const title = project.title;
      const listItem = document.createElement("li");
      listItem.textContent = title;
      listEl.appendChild(listItem);
    });
  }

  private renderContent() {
    const listId = `${this.type}-project-list`;
    this.htmlElement.querySelector("ul")!.id = listId;
    this.htmlElement.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " Projects";
  }
  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.htmlElement);
  }
}

// ProjectInput
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  htmlElement: HTMLElement;

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.querySelector(
      "#project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.querySelector("#app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.htmlElement = importedNode.firstElementChild as HTMLFormElement;
    this.htmlElement.id = "user-input";

    this.titleInputElement = this.htmlElement.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputElement = this.htmlElement.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInputElement = this.htmlElement.querySelector(
      "#people"
    )! as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private clearInput(form: HTMLFormElement): void {
    let inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll("input");
    inputs.forEach((element) => {
      element.value = "";
    });
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;
    const titleValidatable = {
      value: enteredTitle,
      required: true,
      minLength: 2,
      maxLength: 20,
    };
    const descriptionValidatable = {
      value: enteredDescription,
      required: true,
      minLength: 2,
      maxLength: 50,
    };
    const peopleValidatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Enter valid Input");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;

      projectState.addProjects(title, description, people);
      this.clearInput(event.target as HTMLFormElement);
    }
  }
  private configure() {
    this.htmlElement.addEventListener("submit", this.submitHandler.bind(this));
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.htmlElement);
  }
}
const projectState = ProjectState.getInstance();

const prjInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
