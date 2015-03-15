$(window).load(function(){
  var canv_ent={};
  var canv_ent_obj={};
  var fe_scene={};
  var frames_col=0;
  var frame=1;
  var state=0;
  
  // == Инициализация == //
  var canv_main=document.createElement('canvas');  // Создаём элемент типа "канвас"
  canv_main.width=$('#fe_visuals').width();  // Устанавливаем свойства ширины канваса
  canv_main.height=$('#fe_visuals').height();  // Устанавливаем свойства высоты канваса
  $('#fe_visuals').append(canv_main);  // Добавляем новый элемент в DOM
  var canv_main_obj=canv_main.getContext('2d');  // Получение объекта канваса

  // == Отправка формы == //
  $('#fe_form').submit(function(e) {
    e.preventDefault();  // Предотвращаем стандартную отправку формы   
			$.post($('#fe_url').val(), $('#fe_scene').val(), function(r) {  // Отправляем данные
      fe_scene=JSON.parse(r);  // Парсим JSON массив
      frames_col=0;  // Обнуляем количество кадров
      for(var f in fe_scene["frames"]) frames_col++;  // Считаем количество кадров
      for(var p in fe_scene["entities"]) {  // Перебираем сущности
        switch(fe_scene["entities"][p]["type"]) {
          case 'rect':  // Если элемент - прямоугольник
            newRect(p, fe_scene["entities"][p]["width"], fe_scene["entities"][p]["height"], fe_scene["entities"][p]["color"]);  // Рендерим прямоугольник
            break;
          case 'circle':  // Если элемент - круг
            newCircle(p, fe_scene["entities"][p]["r"], fe_scene["entities"][p]["color"]);  // Рендерим круг
            break;
        }
      }
      frame=1;  // Переключаемся на первый кадр
      if(state==0) {  // Если состояние Стоп
        state=1;  // Меняем состояние на Проигрывание
        fe_draw_frame();  // Начинаем отрисовку
			}
    });
  });
	
	// == Отрисовка кадра сцены == //
  function fe_draw_frame() {
		canv_main_obj.clearRect(0, 0, canv_main.width, canv_main.height);  // Очищаем холст
		for(var p in fe_scene["frames"]["f"+frame]) {  // Перебираем энтити в данном кадре
			canv_main_obj.drawImage(canv_ent[p], fe_scene["frames"]["f"+frame][p]["x"], fe_scene["frames"]["f"+frame][p]["y"]);  // Выводим энтити на холст
		}
		if(frame>=frames_col) frame=1; else frame++;  // Если текущий кадр последний - переходим на первый, иначе - переходим на следующий
		var ani_hnd=requestAnimationFrame(fe_draw_frame, canv_main);  // Рисуем следующий кадр
  }

  // == Отрисовка элемента типа прямоугольник == //
  function newRect(id, width, height, color) {
		canv_ent[id]=document.createElement('canvas');  // Создаём холст под рендеринг элемента
		canv_ent[id].width=width;
		canv_ent[id].height=height;
    canv_ent_obj[id] = canv_ent[id].getContext('2d');  // Получаем объект холста
    canv_ent_obj[id].strokeStyle=color;  // Задаём цвет прямоугольника
    canv_ent_obj[id].rect(0,0,width,height);  // Задаём параметры прямоугольника
    canv_ent_obj[id].stroke();  // Рисуем прямоугольник
  }
  
    // == Отрисовка элемента типа круг == //
  function newCircle(id, r, color) {
		canv_ent[id]=document.createElement('canvas');  // Создаём холст под рендеринг элемента
		canv_ent[id].width=r*2;
		canv_ent[id].height=r*2;
    canv_ent_obj[id] = canv_ent[id].getContext('2d');  // Получаем объект холста  
    canv_ent_obj[id].beginPath();
    canv_ent_obj[id].arc(r, r, r, 0, 2*Math.PI, false);  // Задаём параметры круга   
    canv_ent_obj[id].lineWidth = 1;
    canv_ent_obj[id].strokeStyle = color;  // Задаём цвет круга
    canv_ent_obj[id].stroke();  // Рисуем круга
  }

});