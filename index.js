// == Хендлеры и действия при загрузке страницы == //
$(window).load(function() {
  var fe_counter=0;
  var fe_play=0;
  var fe_compression=0;

  $('#fe_use_compression').prop('checked', false); 
  $('#fe_show_vectors').prop('checked', false);
  $('#fe_info').val('');
  $('#fe_counter').val('');
   
  var ObjScene = $('#fe_canvas').vplvisual({'width': $('#fe_visuals').width(), 'height': $('#fe_visuals').height()});  // Инициализация объекта сцены
  
  // == Кнопка Проиграть == //
  $('#fe_controls_play').click(function(e) {
    if(fe_play==0) {
      ObjScene.play();  // Запускаем проигрывание
      fe_play=1;
      $('#fe_controls_play').css({'background-image':'url("./img/pause.png"'});
    } else {
      ObjScene.pause();
      fe_play=0;
      $('#fe_controls_play').css({'background-image':'url("./img/play.png"'});
    }
  });
  
  // == Кнопка Стоп == //
  $('#fe_controls_stop').click(function(e) {
    ObjScene.stop();  // Останавливаем проигрывание
    if(fe_play==1) {
      $('#fe_controls_play').css({'background-image':'url("./img/play.png"'});
      fe_play=0;
    }
	});

  // == Кнопка Назад == //
  $('#fe_controls_prev').click(function(e) {
    ObjScene.previousFrame();  // Вызываем предыдущий кадр
    if(fe_play==1) {
      $('#fe_controls_play').css({'background-image':'url("./img/play.png"'});
      fe_play=0;
    }
	});

  // == Кнопка Вперёд == //
  $('#fe_controls_next').click(function(e) {
    ObjScene.nextFrame();  // Вызываем следующий кадр
    if(fe_play==1) {
      $('#fe_controls_play').css({'background-image':'url("./img/play.png"'});
      fe_play=0;
    }
	});

  // == Кнопка Применить сцену == //
	$('#fe_scene_apply').click(function(e) {
    var r=ObjScene.getAnimation($('#fe_url').val(), $('#fe_scene').val(), fe_compression);
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

  ObjScene.onAnimationRecieved(function(e) {
    var s=ObjScene.getAnimSize();
    ObjScene.loadAnimationDocument(ObjScene.getRecievedAnimation());  // Передаём анимацию в сцену
    var compr='';
    if(fe_compression==0) {
      compr='Сжатие не используется';
    } else {
      compr='Используется сжатие';
    }
    $('#fe_info').val('Размер анимации: '+s+' байт\n'+compr);
  });

  $('#fe_show_vectors').click(function() {
    if($(this).prop("checked")) {
      ObjScene.showVectors();
    } else {
      ObjScene.hideVectors();
    }
  });
  
  $('#fe_use_compression').click(function() {
    if($(this).prop("checked")) {
      fe_compression=1;
    } else {
      fe_compression=0;
    }
  });

});
