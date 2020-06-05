// Create 3 Modules
// UI Controller: update and display UI
// Budget Controller: handle events and data
// Controller

//UI Controller (independent)
var UIController = (function () {
    var DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, element, newHTML;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstring.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.dedescription);
            newHTML = newHTML.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearfix: function () { // clear input field after click or enter the button
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstring.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstring.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstring.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }
        },

        getDOMstring: function () {
            return DOMstring;
        }
    }
})();



// Budget Controller (independent)
var budgetController = (function () {
    var Incomes = function (id, description, value) {
        this.id = id;
        this.dedescription = description;
        this.value = value;
    }

    var Expenses = function (id, description, value) {
        this.id = id;
        this.dedescription = description;
        this.value = value;
    }

    var calcTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newITEM;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp'
            if (type === 'inc') {
                newITEM = new Incomes(ID, des, val);
            } else if (type === 'exp') {
                newITEM = new Expenses(ID, des, val);
            }

            // push it into data structure
            data.allItems[type].push(newITEM);

            return newITEM;
        },

        calculateBudget: function () {
            // calc total each income & expenses
            calcTotal('inc');
            calcTotal('exp');
            // calc the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calc the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    }
})();



// Controller (connect 2 modules)
var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListener = function () {
        var DOM = UICtrl.getDOMstring(); // DOM id input

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); // Handle event button click

        document.addEventListener('keypress', function (event) { // Handle event button press
            if (event.keyCode === 13 || event.which === 13) // property 'which' use for old browser
            {
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function () {
        // 1) Calculate the budget
        budgetCtrl.calculateBudget();
        // 2) Return Budget
        var budget = budgetCtrl.getBudget();
        // 3) Update and display budget on the UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () { // get input value function
        var input, newItem;

        // 1) Get the field input
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2) Add the item to the Budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3) Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4) Clear the field input after click or enter button 
            UICtrl.clearfix();

            // 5) Calculate and update Budget
            updateBudget();
        }
    };

    return {
        init: function () {
            console.log('Application has started!');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);

controller.init();