/*global Handlebars, Router */
// jQuery(function ($) { 
// document.addEventListener('DOMContentLoaded', function() {
//   'use strict';

Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

var util = {
  uuid: function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  },
  pluralize: function (count, word) {
    return count === 1 ? word : word + 's';
  },
  store: function (namespace, data) { 
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  }
};

var App = {
  init: function () {
    this.todos = util.store('todos-jquery');

    var todoTemplate = document.getElementById('todo-template');
    this.todoTemplate = Handlebars.compile(todoTemplate.innerHTML);

    var footerTemplate = document.getElementById('footer-template');
    this.footerTemplate = Handlebars.compile(footerTemplate.innerHTML);
    this.bindEvents();

    new Router({
      '/:filter': function (filter) {
        this.filter = filter;
        this.render();
      }.bind(this)
    }).init('/all');
  },
  bindEvents: function () {     
    document.getElementById('new-todo').addEventListener('keyup', this.create.bind(this));         
    document.getElementById('toggle-all').addEventListener('change', this.toggleAll.bind(this));     
    document.getElementById('footer').addEventListener('click', function(e) {
      if (e.target.id === 'clear-completed') {
        // App.destroyCompleted();
    //   }
    // }), 
        this.destroyCompleted();
      }
    }.bind(this)),    
    document.getElementById('todo-list').addEventListener('change', function(e) {
      if (e.target.type === 'checkbox') {
        App.toggle(e);
      }
    });    
    document.getElementById('todo-list').addEventListener('dblclick', function(e) {  
      if (e.target.tagName === 'LABEL') {
      App.edit(e);
      }
    });     
    document.getElementById('todo-list').addEventListener('keyup', function(e) {
      if (e.target.className === 'edit') {
        App.editKeyup(e);
      }
    });    
    document.getElementById('todo-list').addEventListener('focusout', function(e) {
      if (e.target.className === 'edit') {
        App.update(e);
      }
    });    
    document.getElementById('todo-list').addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') {
        App.destroy(e);
      }
    });
  },
  render: function () {
    var todos = this.getFilteredTodos();
    var main = document.getElementById('main');
    var todoList = document.getElementById('todo-list');
    var toggleAll = document.getElementById('toggle-all');

    todoList.innerHTML = this.todoTemplate(todos);
    if (todos.length > 0) {
      main.style.display = 'block';
    }    
    if (this.getActiveTodos.length === 0) {
       toggleAll.checked;
      } else {
        !toggleAll.checked;
      }
    this.renderFooter();
    document.getElementById('new-todo').focus();
    util.store('todos-jquery', this.todos);  // in 'render, 'store' is called with two arguments.
  },
  renderFooter: function () {
    var todoCount = this.todos.length;
    var activeTodoCount = this.getActiveTodos().length;
    var template = this.footerTemplate({
      activeTodoCount: activeTodoCount,
      activeTodoWord: util.pluralize(activeTodoCount, 'item'),
      completedTodos: todoCount - activeTodoCount,
      filter: this.filter
    });
    var footer = document.getElementById('footer');
    footer.innerHTML = template;
    if (this.todos.length > 0) {
      footer.style.display = 'block';
    }
  },
  toggleAll: function (e) {
    var isChecked = document.getElementById('toggle-all').checked;
    this.todos.forEach(function (todo) {
      todo.completed = isChecked;
    });
    this.render();
  },
  getActiveTodos: function () {
    return this.todos.filter(function (todo) {
      return !todo.completed;
    });
  },
  getCompletedTodos: function () {
    return this.todos.filter(function (todo) {
      return todo.completed;
    });
  },
  getFilteredTodos: function () {
    if (this.filter === 'active') {
      return this.getActiveTodos();
    }
    if (this.filter === 'completed') {
      return this.getCompletedTodos();
    }
    return this.todos;
  },
  destroyCompleted: function () {
    this.todos = this.getActiveTodos();
    this.filter = 'all';
    this.render();
  },
  indexFromEl: function (el) {
    var id = el.closest('li').getAttribute('data-id');
    var todos = this.todos;
    var i = todos.length;
    while (i--) {
      if (todos[i].id === id) {
        return i;
      }
    }
  },
  create: function (e) {
      var input = document.querySelector('#new-todo');
      var val = input.value;
      if (e.which !== ENTER_KEY || !input) {
        return;
      }
       this.todos.push({ 
      id: util.uuid(),
      title: val,
      completed: false
    });      
    input.value = '';
    this.render(); 
  },
  toggle: function (e) {
    var i = this.indexFromEl(e.target);
    this.todos[i].completed = !this.todos[i].completed;
    this.render();
  },
  edit: function (e) {
    var input = e.target.closest('li');
    input.className = 'editing';
    input.querySelector('.edit').focus();
  },
  editKeyup: function (e) {
    if (e.which === ENTER_KEY) {
    e.target.blur();
    }
    if (e.which === ESCAPE_KEY) {
      e.target.data = 'abort';
      e.target.blur();
    }
  },
  update: function (e) {
    var el = e.target;
    var val = el.value.trim();
    if (!val) {
      this.destroy(e);
      return;
    }
    if (el.data === 'abort') {
      el.data !== 'abort';
    } else {
      this.todos[this.indexFromEl(el)].title = val;
    }
    this.render();
  },
  destroy: function (e) {
    this.todos.splice(this.indexFromEl(e.target), 1);
    this.render();
  }
};
App.init();
