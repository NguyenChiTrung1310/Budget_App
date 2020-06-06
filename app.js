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
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

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
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstring.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.dedescription);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields;

            fields = document.querySelectorAll(DOMstring.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstring.inputType + ',' +
                DOMstring.inputDescription + ',' +
                DOMstring.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstring.inputBtn).classList.toggle('red');
        },

        displayMonth: function () {
            var now, year, month, months;

            now = new Date();

            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;
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
    };

    var Expenses = function (id, description, value) {
        this.id = id;
        this.dedescription = description;
        this.value = value;
        this.percentage = -1
    };

    Expenses.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expenses.prototype.getPercentage = function () {
        return this.percentage;
    };

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

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

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

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updatePercentages = function () {
        // 1) Calc percentages
        budgetCtrl.calculatePercentages();
        // 2) Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3) Update UI with new percentages
        UICtrl.displayPercentages(percentages);
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

            // 6) Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // when hit button (X), event will move up 4 times to id of div element  

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1) Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2) Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3) Update and show the new Budget
            updateBudget();
        }

    };

    return {
        init: function () {
            console.log('Application has started!');
            UICtrl.displayMonth();
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