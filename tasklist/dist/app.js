"use strict";
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
// Project Class
var Project = /** @class */ (function () {
    function Project(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
    return Project;
}());
// ProjectState
var ProjectState = /** @class */ (function () {
    function ProjectState() {
        this.listeners = [];
        this.projects = [];
    }
    ProjectState.getInstance = function () {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    };
    ProjectState.prototype.addListener = function (listenerFn) {
        this.listeners.push(listenerFn);
    };
    ProjectState.prototype.addProjects = function (title, description, people) {
        var _this = this;
        var newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);
        this.projects.push(newProject);
        this.listeners.forEach(function (listenerFn) {
            listenerFn(_this.projects.slice());
        });
    };
    return ProjectState;
}());
function validate(validatableInput) {
    var isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid && validatableInput.value.length < validatableInput.maxLength;
    }
    if (validatableInput.min != null &&
        typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value > validatableInput.min;
    }
    if (validatableInput.max != null &&
        typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value < validatableInput.max;
    }
    return isValid;
}
// ProjectList
var ProjectList = /** @class */ (function () {
    function ProjectList(type) {
        var _this = this;
        this.type = type;
        this.templateElement = document.querySelector("#project-list");
        this.hostElement = document.querySelector("#app");
        var importedNode = document.importNode(this.templateElement.content, true);
        this.htmlElement = importedNode.firstElementChild;
        this.htmlElement.id = this.type + "-projects";
        this.assignedProjects = [];
        projectState.addListener(function (projects) {
            var relavantProject = projects.filter(function (project) {
                if (_this.type === 'active')
                    return project.status === ProjectStatus.Active;
                return project.status === ProjectStatus.Finished;
            });
            _this.assignedProjects = relavantProject;
            _this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    ProjectList.prototype.renderProjects = function () {
        var listEl = document.querySelector("#" + this.type + "-project-list");
        listEl.textContent = '';
        this.assignedProjects.forEach(function (project) {
            var title = project.title;
            var listItem = document.createElement("li");
            listItem.textContent = title;
            listEl.appendChild(listItem);
        });
    };
    ProjectList.prototype.renderContent = function () {
        var listId = this.type + "-project-list";
        this.htmlElement.querySelector("ul").id = listId;
        this.htmlElement.querySelector("h2").textContent =
            this.type.toUpperCase() + " Projects";
    };
    ProjectList.prototype.attach = function () {
        this.hostElement.insertAdjacentElement("beforeend", this.htmlElement);
    };
    return ProjectList;
}());
// ProjectInput
var ProjectInput = /** @class */ (function () {
    function ProjectInput() {
        this.templateElement = document.querySelector("#project-input");
        this.hostElement = document.querySelector("#app");
        var importedNode = document.importNode(this.templateElement.content, true);
        this.htmlElement = importedNode.firstElementChild;
        this.htmlElement.id = "user-input";
        this.titleInputElement = this.htmlElement.querySelector("#title");
        this.descriptionInputElement = this.htmlElement.querySelector("#description");
        this.peopleInputElement = this.htmlElement.querySelector("#people");
        this.configure();
        this.attach();
    }
    ProjectInput.prototype.clearInput = function (form) {
        var inputs = form.querySelectorAll("input");
        inputs.forEach(function (element) {
            element.value = "";
        });
    };
    ProjectInput.prototype.gatherUserInput = function () {
        var enteredTitle = this.titleInputElement.value;
        var enteredDescription = this.descriptionInputElement.value;
        var enteredPeople = this.peopleInputElement.value;
        var titleValidatable = {
            value: enteredTitle,
            required: true,
            minLength: 2,
            maxLength: 20,
        };
        var descriptionValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 2,
            maxLength: 50,
        };
        var peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert("Enter valid Input");
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    };
    ProjectInput.prototype.submitHandler = function (event) {
        event.preventDefault();
        var userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            var title = userInput[0], description = userInput[1], people = userInput[2];
            projectState.addProjects(title, description, people);
            this.clearInput(event.target);
        }
    };
    ProjectInput.prototype.configure = function () {
        this.htmlElement.addEventListener("submit", this.submitHandler.bind(this));
    };
    ProjectInput.prototype.attach = function () {
        this.hostElement.insertAdjacentElement("afterbegin", this.htmlElement);
    };
    return ProjectInput;
}());
var projectState = ProjectState.getInstance();
var prjInput = new ProjectInput();
var activeProjectList = new ProjectList("active");
var finishedProjectList = new ProjectList("finished");
