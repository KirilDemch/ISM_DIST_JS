var debug = false;


// Создание точки и ее настройки
function Point() {
    this.is_mine = false;
    this.mine_around = 0;
    this.is_open = false;
}

// Логика игры
var game = {
    width: 10,
    height: 10,
    mine_count: 10,
    open_count: 0,
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

    start: function () {
        this.open_count = 0;
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
                if(e.target.matches('td')) self.lock(e);
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
                table.appendChild(tr);
            }
            // Позже сгенерировать поле див в которе вставить даный фрагмент
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
                console.log(td);
                console.log(this.table.rows[y]);

                if(game.field[x][y].is_open) return;
                if(game.field[x][y].is_mine) {
                    alert('Game Over!!');
                    game.start();
                    this.draw_field();
                } else {
                    td.innerHTML = game.field[x][y].mine_around;
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

                    if(game.width * game.height - game.mine_count == game.open_count){
                        alert('You Win!!!');
                        game.start();
                        this.draw_field();
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
    page.init();
}
