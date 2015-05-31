// == Хендлеры и действия при загрузке страницы == //
$(window).load(function() {
  fe_counter=0;

  var ObjScene = $('#fe_canvas').vplvisual({'width': $('#fe_visuals').width(), 'height': $('#fe_visuals').height()});  // Инициализация объекта сцены
  
  // == Кнопка Проиграть == //
  $('#fe_controls_play').click(function(e) {
    ObjScene.play();  // Запускаем проигрывание
  });
  
  // == Кнопка Стоп == //
  $('#fe_controls_stop').click(function(e) {
    ObjScene.stop();  // Останавливаем проигрывание
	});

  // == Кнопка Назад == //
  $('#fe_controls_prev').click(function(e) {
    ObjScene.previousFrame();  // Вызываем предыдущий кадр
	});

  // == Кнопка Вперёд == //
  $('#fe_controls_next').click(function(e) {
    ObjScene.nextFrame();  // Вызываем следующий кадр
	});

  // == Кнопка Применить сцену == //
	$('#fe_scene_apply').click(function(e) {
    $.post($('#fe_url').val(), $('#fe_scene').val(), function(r) {  // Отправляем сцену бэкенду и принимаем анимацию
      $('#fe_info').val(r);
      ObjScene.loadAnimationDocument(r);  // Передаём анимацию в сцену 
    });
	});
	
	// == Кнопка Сохранить сцену == //
	$('#fe_scene_save').click(function(e) {
    $.cookie('ps_scene', $('#fe_scene').val(), { expires: 30 });  // Записываем сцену в кукисы
	});
	
	// == Кнопка Загрузить сохранённую сцену == //
	$('#fe_scene_load').click(function(e) {
    if($.cookie('ps_scene')) $('#fe_scene').val($.cookie('ps_scene'));  // Восстанавливаем сцену из кукисов
	});
	
	// == Кнопка Загрузить стандартную сцену == //
	$('#fe_scene_default').click(function(e) {
    $.get('./default_scene?'+new Date().getTime(), function(r){  // Читаем файл со стандартной сценой
      $('#fe_scene').val(r);  // Помещаем содержимое в соотв. поле
    });
	});
  
  // == Клик на сцене == //
  $('#fe_canvas').click(function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    var info=ObjScene.getObjectPropertiesByCoord(x, y);
    $('#fe_info').val(JSON.stringify(info));
  });

  ObjScene.onFrameChanged(function() {
    $('#fe_controls_progress').width(ObjScene.getCurrentFrame()*(500/ObjScene.HowManyFrames()));
  });

  ObjScene.onAnimationEnd(function() {
    fe_counter++;
    $('#fe_counter').val(fe_counter);
  });

});
