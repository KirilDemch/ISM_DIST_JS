// true - отобразить значение всех полей и увидеть расположение бомб
var debug = false;


var settings = {
    init: function () {
        this.draw_menu();
        this.init_elem_menu();
    },

    init_elem_menu: function () {
        generateButton.addEventListener('click', function (e) {
            e.preventDefault();
            let width = parseInt(document.querySelector('#width').value);
            let height = parseInt(document.querySelector('#height').value);
            let mine_count = parseInt(document.querySelector('#mineCount').value);
            if ( (width && height && mine_count) <= 1  && (width && height && mine_count) <= 100) {
                alert('Ширина, высота и количество мин должно быть больше 1 и не больше 100');
                return;
            }
            if(width != height) {
                alert('Ширина и высота должны быть одинаковы');
                return;
            }
            game.width = width;
            game.height = height;
            game.mine_count = mine_count;
            page.init();

        });

    },

    draw_menu: function () {
        let body = document.body;
        // Создаем форму, в которой будут распологатся поля для заполнения
        let form = document.createElement('form');


        // Создаем поле для ввода ширины поля
        let label_input_width = document.createElement('label');
        label_input_width.setAttribute("for", 'width');
        label_input_width.innerHTML = 'Ширина поля = ';

        let input_width = document.createElement('input');
        input_width.id = 'width';
        input_width.setAttribute("type", 'number');
        input_width.setAttribute("name", 'width');
        input_width.setAttribute("value", '0');

        let form_width_div = document.createElement('div');
        form_width_div.className = 'form_item';
        form_width_div.appendChild(label_input_width);
        form_width_div.appendChild(input_width);


        // Создаем поле для ввода высоты поля
        let label_input_height = document.createElement('label');
        label_input_height.setAttribute('for', 'height');
        label_input_height.innerHTML = 'Высота поля = ';

        let input_height = document.createElement('input');
        input_height.id = 'height';
        input_height.setAttribute("type", 'number');
        input_height.setAttribute("name", 'height');
        input_height.setAttribute("value", '0');

        let form_height_div = document.createElement('div');
        form_height_div.className = 'form_item';
        form_height_div.appendChild(label_input_height);
        form_height_div.appendChild(input_height);


        // Создаем поле для ввода количества мин на поле
        let label_mine_count = document.createElement('label');
        label_mine_count.setAttribute('for', 'mineCount');
        label_mine_count.innerHTML = 'Количество мин на поле = ';

        let input_mine_count = document.createElement('input');
        input_mine_count.id = 'mineCount';
        input_mine_count.setAttribute("type", 'number');
        input_mine_count.setAttribute("name", 'mineCount');
        input_mine_count.setAttribute("value", '0');

        let form_mine_count_div = document.createElement('div');
        form_mine_count_div.className = 'form_item';
        form_mine_count_div.appendChild(label_mine_count);
        form_mine_count_div.appendChild(input_mine_count);


        // Cоздаем кнопку для генерации поля
        let generate_button = document.createElement('button');
        generate_button.id = 'generateButton';
        generate_button.innerHTML = "Сгенерировать поле";

        form.appendChild(form_width_div);
        form.appendChild(form_height_div);
        form.appendChild(form_mine_count_div);
        form.appendChild(generate_button);
        body.appendChild(form);
    }



}


// Создание точки и ее настройки
function Point() {
    this.is_mine = false;
    this.mine_around = 0;
    this.is_open = false;
}

// Логика игры
var game = {
    width: 0,
    height: 0,
    mine_count: 0,
    open_count: 0,
    lock_count: 0,
    field: [],

    // Метод который раставляет мины
    fill_field: function () {
        this.field = [];

        // Создание поля и заполнение объектами
        for (let i = 0; i < this.width; i++) {
            var tmp = [];
            for (let j = 0; j < this.height; j++){
                tmp.push(new Point());
            }
            this.field.push(tmp);
        }

        // Генерация мин, выполнять пока не раставяться все мины
        for (let i = 0; i < this.mine_count;) {

            // Генерация точки расположения мины, - 0.0001 - что бы не выпало самое крайнее значение
            let x = parseInt(Math.random() * this.width - 0.0001);
            let y = parseInt(Math.random() * this.height - 0.0001);

            // Проверка если по этим координатам мина, если нету то поставить
            if (!this.field[x][y].is_mine) {
                this.field[x][y].is_mine = true;
                i++;
            }
        }
    },

    // Щитаем количество мин вокруг одной точки x y,
    // в диапазоне [y - 1][x - 1] -> [y + 1][x + 1]
    // так же проверять не вышли ли за пределы поля
    mine_around_counter: function (x, y) {

        // Проверка не вышли ли за пределы
        let x_start = x > 0 ? x - 1 : x;
        let y_start = y > 0 ? y - 1 : y;
        let x_end = x < this.width - 1 ? x + 1 : x;
        let y_end = y < this.height - 1 ? y + 1 : y;

        let count = 0;

        for(let i = x_start; i <= x_end; i++) {
            for (let j = y_start; j <= y_end; j++){
                if (this.field[i][j].is_mine  && !(x == i && y == j)) count++;
            }
        }

        this.field[x][y].mine_around = count;
    },


    // Щитаем количество мин вокруг остальных точек
    start_mine_counter: function() {
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                this.mine_around_counter(i, j);
            }
        }
    },
    restart: function () {
        this.body = document.body;
        this.body.innerHTML = '';
        settings.init();
    },

    start: function () {
        this.open_count = 0;
        this.lock_count = 0;
        this.score = 0;
        this.fill_field();
        this.start_mine_counter();
    },
};



// Обьект который отвечает за прорисовку игры
var page = {
    init: function () {
       this.game_interface.init();

    },
    game_interface: {

        table: null,

        init: function () {
            game.start();
            this.body = document.body;
            this.draw_field();
            let self = this;
            this.body.addEventListener('click', function(e) {
               if(e.target.matches('td') && !e.target.matches('.lock')) self.open(e);
            });
            this.body.addEventListener('contextmenu', function(e) {
                if (e.target.matches('.lock')) {
                    self.lock(e);
                    game.lock_count--;
                    return;
                }
                if(e.target.matches('td') && game.lock_count !== game.mine_count) {
                    self.lock(e);
                    game.lock_count++;
                    return;
                }
                if (game.lock_count == game.mine_count) {
                    alert('Вы использовали все флажки');
                    e.preventDefault();
                }
            });
            this.body.addEventListener('click', function (e) {
                if(e.target.matches('#newGameButton')){
                    game.restart();
                }
            });
        },

        // создаем и отрисовываем поле
        draw_field: function () {
            this.body.innerHTML = '';
            let table = document.createElement('table');
            this.table = table;
            for (let i = 0; i < game.height; i++ ){
                let tr = document.createElement('tr');
                for (let j = 0; j < game.width; j++){
                    let td = document.createElement('td');

                    if(debug) {
                        td.innerHTML = game.field[j][i].mine_around;
                        if(game.field[j][i].is_mine) td.style.background = 'red';
                    }

                    tr.appendChild(td);
                }
                table.style.margin = "20px auto";
                table.appendChild(tr);
            }
            let new_game_button = document.createElement('button');
            new_game_button.id = 'newGameButton';
            new_game_button.innerHTML = 'Новая Игра';
            new_game_button.style.margin = "20px auto";
            new_game_button.style.display = "block";

            this.body.appendChild(new_game_button);
            this.body.appendChild(table);

        },

        // Открытие ячейки
        open: function (event) {


            x = event.target.cellIndex;
            y = event.target.parentNode.rowIndex;
            this.recurse_open(x, y);


        },

        // Функция рукурсивного открытия ячеек
        recurse_open: function (x, y) {
            try {
                let td = this.table.rows[y].children[x];

                if(game.field[x][y].is_open) return;
                if(game.field[x][y].is_mine) {
                    alert('Проигрыш!');
                    game.start();
                    this.draw_field();
                } else {
                    td.innerHTML = game.field[x][y].mine_around == 0 ? "" : game.field[x][y].mine_around;
                    game.field[x][y].is_open = true;

                    if (game.field[x][y].mine_around == 0) {
                        for(let i = x > 0 ? x - 1 : x; i <= x + 1 && i < game.width; i++) {
                            for (let j = y > 0 ? y - 1 : y; j <= y + 1 && i < game.height; j++) {
                                this.recurse_open(i, j);
                            }
                        }
                    }
                    td.classList.add('open');
                    game.open_count++;
                    if(game.width * game.height - game.mine_count == game.open_count) {
                        setTimeout(() => { // Задержка сделана для визуальности
                            alert('Победа!!!');
                            game.start();
                            this.draw_field();
                        }, 100);
                    }
                }
            } catch (e) {
                console.log(e);
            }

        },
        lock: function (event) {
            x = event.target.cellIndex;
            y = event.target.parentNode.rowIndex;
            if(game.field[x][y].is_open) return;

            event.target.classList.toggle('lock');
            event.preventDefault();
        }
    }
};

window.onload = function () {
    settings.init();
}
