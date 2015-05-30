// == Хендлеры и действия при загрузке страницы == //
$(window).load(function() {

  var ObjScene = $('#fe_canvas').initscene({'width': $('#fe_visuals').width(), 'height': $('#fe_visuals').height()});  // Инициализация объекта сцены
  
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
    var info=ObjScene.getEntityInfo(x, y);
    $('#fe_info').val(JSON.stringify(info));
  });

});

// == jQuery плагин == //
(function($){
  var canv_main, canv_main_obj;
  var canv_ent={};  // DOM-объекты холстов для сущностей
  var canv_ent_obj={};  // Объекты холстов для сущностей
  var fe_scene={};  // Массив под сцену
  var frames_col=0;  // Количество кадров
  var frame=0;  // Номер текущего кадра
  var state=0;  // Состояние (0 стоп, 1 проигрывание)
  var last_time=0;  // Переменная под последнее время
  var start_frame=0;  // Номер первого кадра
  
  // == Методы плагина == //
  var methods = {
  
    loadAnimation:function(json_doc) {
      fe_scene=JSON.parse(json_doc);  // Парсим JSON массив
      frames_col=0;  // Обнуляем количество кадров
      for(var f in fe_scene["frames"]) frames_col++;  // Считаем количество кадров
      for(var p in fe_scene["entities"]) {  // Перебираем сущности
        switch(fe_scene["entities"][p]["type"]) {  // Выбираем сущность по типу
          case 'rect':  // Если элемент - прямоугольник
            newRect(p, fe_scene["entities"][p]["width"], fe_scene["entities"][p]["height"], fe_scene["entities"][p]["color"]);  // Рендерим прямоугольник
            break;
          case 'circle':  // Если элемент - круг
            newCircle(p, fe_scene["entities"][p]["r"], fe_scene["entities"][p]["color"]);  // Рендерим круг
            break;
        }
      }
      frame=0;  // Переключаемся на нулевой кадр
      if(state==0) {  // Если сцена не проигрывается в данный момент
        fe_draw_frame();  // Отрисовываем один кадр
      }
    },
    
    stop:function() {
      frame=0;  // Переключаемся на первый кадр
      state=0;  // Останавливаем проигрывание
    },
    
    play:function() {
      frame=0;  // Переключаемся на первый кадр
      if(state==0) {  // Если состояние Стоп
        state=1;  // Меняем состояние на Проигрывание
        fe_draw_frame(); // Запускаем отривку кадров
      }
    },
    
    frames_count:function() {
      return frames_col;  // Возвращаем количество кадров
    },
    
    goToFrame:function(n) {
      frame=n;  // Меняем кадр на желаемый
    },
    
    changeFirstPlayFrame:function(newFrame) {
      start_frame=newFrame;  // Меняем начальный кадр
    },
    
    resetSettings:function() {
      start_frame=0;
      frame=0;
      state=0;
    },
    
    getCurrentFrame:function() {
      return frame;
    },
    
    getEntityInfo:function(x, y) {
      var p = canv_main_obj.getImageData(x, y, 1, 1).data; 
      var s = 0;
      var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      for(var p in fe_scene["frames"][frame]) {  // Перебираем энтити в данном кадре
        if(fe_scene["entities"][p]["color"]==hex) {
          var ret=fe_scene["entities"][p];
          $.extend(ret, fe_scene["frames"][frame][p]);
          return ret;
          break;
        }
      }
      return 'none';
    },
    
    nextFrame:function() {
      frame++;  // Меняем кадр на следующий
      state=0;
      fe_draw_frame();  // Отрисовываем один кадр
    },
    
    previousFrame:function() {
      frame--;  // Меняем кадр на предыдущий
      state=0;
      fe_draw_frame();  // Отрисовываем один кадр
    },
    
    onFrameChanged:function(handler) {
      $(this).bind('onFrameChanged.initscene', handler);
    }
  };

  $.fn.initscene = function(options){
    var settings = {  // Параметры по-умолчанию
      'width': '800',
      'height': '600'
    };
 
    // == Инициализация, действия, которые выполняются при вызове .initscene == //
    this.each(function() {
      if(options){
        $.extend(settings, options); // Если были заданы параметры, то заменить параметры по-умолчанию на новые
      }
      
      canv_main = $(this);  // Запоминаем сам объект, с которым работаем сейчас (чтобы знать, к какому объекту обращаться потом)
      canv_main_obj=this.getContext('2d');  // Получение объекта канваса
      $(canv_main).css('width', settings.width);  // Задаём ширину канваса
      $(canv_main).css('height', settings.height);  // Задаём высоту канваса
      canv_main_obj.canvas.width=settings.width;
      canv_main_obj.canvas.height=settings.height;
      canv_main_obj.setTransform(1, 0, 0, -1, -0, (canv_main_obj.canvas.height)); //меняем оси координат и начало координат, значения по парам: 1,0 - ось Х направлена вправо, 0,-1 - ось У направлена вверх, -0, canv_main.height переносим начало координат в нижний левый угол
    });
 
    // Возвращаем объект и методы, доступные объекту
    return { 
      loadAnimationDocument : function(json_doc) {  
        methods.loadAnimation.apply(canv_main, [json_doc]);
      },
    
      stop : function() {
        methods.stop();
      },
    
      play : function() {
        methods.play();
      },
    
      HowManyFrames : function(){
        return methods.frames_count();
      },
    
      goToFrame : function(N) {
        methods.goToFrame.apply(canv_main, [N]);
      },
    
      changeFirstPlayFrame : function(N) {
        methods.changeFirstPlayFrame.apply(canv_main, [N]);
      },
    
      resetSettings : function() {
        methods.resetSettings();
      },
    
      getCurrentFrame : function() {
        return methods.getCurrentFrame();
      },
      
      getEntityInfo : function(x, y) {
        return methods.getEntityInfo(x, y);
      },
      
      nextFrame:function() {
        methods.nextFrame();
      },
      
      previousFrame:function() {
        methods.previousFrame();
      },

      onFrameChanged:function(handler) {
        methods.onFrameChanged.apply(canv_main, [handler]);     
        var lastframe=methods.getCurrentFrame.apply(canv_main);
        setInterval(function() { 
          if(lastframe!=methods.getCurrentFrame.apply(canv_main)) 
            canv_main.trigger('onFrameChanged.initscene'); //-вызов события
          lastframe=methods.getCurrentFrame.apply(canv_main);
        }, (fe_scene["interval"]/1000));
      },
    
      onFrameChangedoff:function(handler) {
        canv_main.unbind('.initscene');
      }  
    };
  };
	
	// == Отрисовка кадра сцены == //
  function fe_draw_frame() {
    var time = new Date().getTime();
    if(last_time+1<time) {
      last_time = time;
      canv_main_obj.clearRect(0, 0, canv_main_obj.canvas.width, canv_main_obj.canvas.height);  // Очищаем холст
      for(var p in fe_scene["frames"][frame]) {  // Перебираем энтити в данном кадре
        canv_main_obj.drawImage(canv_ent[p], fe_scene["frames"][frame][p]["x"], fe_scene["frames"][frame][p]["y"]);  // Выводим энтити на холст
      }
      $('#fe_controls_progress').width(frame*(500/frames_col));
    }
    if(state==1) {
      if(frame>=frames_col) frame=0; else frame++;  // Если текущий кадр последний - переходим на первый, иначе - переходим на следующий
      requestAnimationFrame(fe_draw_frame, canv_main);  // Рисуем следующий кадр
    }
  }

  // == Рендеринг элемента типа прямоугольник == //
  function newRect(id, width, height, color) {
		canv_ent[id]=document.createElement('canvas');  // Создаём холст под рендеринг элемента
		canv_ent[id].width=width;
		canv_ent[id].height=height;
    canv_ent_obj[id] = canv_ent[id].getContext('2d');  // Получаем объект холста
    canv_ent_obj[id].strokeStyle=color;  // Задаём цвет прямоугольника
    canv_ent_obj[id].rect(0,0,width,height);  // Задаём параметры прямоугольника
    canv_ent_obj[id].fillStyle = color;
    canv_ent_obj[id].fill(); 
    canv_ent_obj[id].stroke();  // Рисуем прямоугольник
  }
  
  // == Рендеринг элемента типа круг == //
  function newCircle(id, r, color) {
		canv_ent[id]=document.createElement('canvas');  // Создаём холст под рендеринг элемента
		canv_ent[id].width=r*2+2;
		canv_ent[id].height=r*2+2;
    canv_ent_obj[id] = canv_ent[id].getContext('2d');  // Получаем объект холста  
    canv_ent_obj[id].beginPath();
    canv_ent_obj[id].arc(r*1+1, r*1+1, r, 0, 2*Math.PI, false);  // Задаём параметры круга
    canv_ent_obj[id].fillStyle = color;
    canv_ent_obj[id].fill();   
    canv_ent_obj[id].lineWidth = 1;
    canv_ent_obj[id].strokeStyle = color;  // Задаём цвет круга
    canv_ent_obj[id].stroke();  // Рисуем круга
  }
  
  // == Преобразование rgb в hex код цвета == //
  function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16);
  }
  
})(jQuery);