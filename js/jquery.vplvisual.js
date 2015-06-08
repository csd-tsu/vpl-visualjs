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
  var show_vectors=0;
  var use_compression=0;
  var scene_size=0;
  var recieved_anim='';
  var new_recieved_anim=0;
  
  // == Методы плагина == //
  var methods = {
  
    getAnimation:function(url, scene, compression=0) {
      use_compression=compression;
      if(compression==0) {
        $.post(url, scene, function(r) {  // Отправляем сцену бэкенду и принимаем анимацию
          scene_size=r.length;
          recieved_anim=r;  // Возвращаем анимацию
          new_recieved_anim=1;
        });
        return true;
      } else {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", $('#fe_url').val(), true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function(oEvent) {
          var arrayBuffer = oReq.response;
          if(arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);
            var gunzip = new Zlib.Gunzip(byteArray);
            var plain = String.fromCharCode.apply(null, gunzip.decompress());
            scene_size=byteArray.length;
            recieved_anim=plain;  // Возвращаем анимацию
            new_recieved_anim=1;
          }
        };
        oReq.send($('#fe_scene').val());
        return true;
      }
    },
  
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
    
    pause:function() {
      state=0;  // Останавливаем проигрывание
    },    
    
    play:function() {
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
    
    getAnimSize:function() {
      return scene_size;
    },
    
    getCurrentFrame:function() {
      return frame;
    },
    
    getObjectPropertiesById:function(p) {
      var ret=fe_scene["entities"][p];
      $.extend(ret, fe_scene["frames"][frame][p]);
      return ret;
    },
    
    getObjectPropertiesByCoord:function(x, y) {
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
    
    getRecievedAnim() {
      return recieved_anim;
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
    
    showVectors:function() {
      show_vectors=1;
      if(state==0)
        fe_draw_frame();  // Отрисовываем один кадр
    },
    
    hideVectors:function() {
      show_vectors=0;
      if(state==0)
        fe_draw_frame();  // Отрисовываем один кадр
    },

    onAnimationEnd:function(handler) {
      $(this).bind('onAnimationEnd.vplvisual', handler);
    },
    
    onAnimationRecieved:function(handler) {
      $(this).bind('onAnimationRecieved.vplvisual', handler);
    },
    
    onFrameChanged:function(handler) {
      $(this).bind('onFrameChanged.vplvisual', handler);
    }
  };

  $.fn.vplvisual = function(options){
    var settings = {  // Параметры по-умолчанию
      'width': '800',
      'height': '600'
    };
 
    // == Инициализация, действия, которые выполняются при вызове .vplvisual == //
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
     
      getAnimation:function(url, scene, compression) {
        return methods.getAnimation(url, scene, compression);
      },
    
      loadAnimationDocument : function(json_doc) {  
        methods.loadAnimation.apply(canv_main, [json_doc]);
      },
    
      stop : function() {
        methods.stop();
      },
    
      play : function() {
        methods.play();
      },

      pause : function() {
        methods.pause();
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

      getAnimSize : function() {
        return methods.getAnimSize();
      },

      getObjectPropertiesById : function(p) {
        return methods.getObjectPropertiesById(p);
      },

      getObjectPropertiesByCoord : function(x, y) {
        return methods.getObjectPropertiesByCoord(x, y);
      },
      
      getRecievedAnimation : function() {
        return methods.getRecievedAnim();
      },
      
      nextFrame:function() {
        methods.nextFrame();
      },
      
      previousFrame:function() {
        methods.previousFrame();
      },

      showVectors:function() {
        methods.showVectors();
      },
      
      hideVectors:function() {
        methods.hideVectors();
      },

      onFrameChanged:function(handler) {
        methods.onFrameChanged.apply(canv_main, [handler]);     
        var lastframe=methods.getCurrentFrame.apply(canv_main);
        setInterval(function() { 
          if(lastframe!=methods.getCurrentFrame.apply(canv_main)) 
            canv_main.trigger('onFrameChanged.vplvisual'); //-вызов события
          lastframe=methods.getCurrentFrame.apply(canv_main);
        }, (fe_scene["interval"]/1000));
      },
      
      onAnimationEnd:function(handler) {
        methods.onAnimationEnd.apply(canv_main, [handler]);     
        var lastframe=methods.getCurrentFrame.apply(canv_main);
        setInterval(function() {
          if(lastframe!=methods.getCurrentFrame.apply(canv_main) && methods.getCurrentFrame.apply(canv_main)==frames_col) 
            canv_main.trigger('onAnimationEnd.vplvisual'); //-вызов события
          lastframe=methods.getCurrentFrame.apply(canv_main);
        }, (fe_scene["interval"]/1000));
      },
      
      onAnimationRecieved:function(handler) {
        methods.onAnimationRecieved.apply(canv_main, [handler]);     
        setInterval(function() {
          if(new_recieved_anim!=0) {
            new_recieved_anim=0;
            canv_main.trigger('onAnimationRecieved.vplvisual');
          }
        }, 100);
      },
    
      onFrameChangedoff:function(handler) {
        canv_main.unbind('.vplvisual');
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
        var halfx, halfy;
        if(typeof fe_scene["entities"][p]["x"]==undefined) fe_scene["entities"][p]["x"]=fe_scene["entities"][p-1]["x"];
        if(typeof fe_scene["entities"][p]["y"]==undefined) fe_scene["entities"][p]["y"]=fe_scene["entities"][p-1]["y"];
        if(fe_scene["entities"][p]["type"]=='circle') {
          halfx=fe_scene["entities"][p]["r"];
          halfy=fe_scene["entities"][p]["r"];
        } else {
          halfx=fe_scene["entities"][p]["width"]/2;
          halfy=fe_scene["entities"][p]["height"]/2;
        }
        canv_main_obj.drawImage(canv_ent[p], fe_scene["frames"][frame][p]["x"]-halfx, fe_scene["frames"][frame][p]["y"]-halfy);  // Выводим энтити на холст
        if(show_vectors==1) {
          if(fe_scene["frames"][frame+1]!= undefined && fe_scene["frames"][frame+5]!= undefined) { 
            canv_main_obj.beginPath();
            canv_main_obj.moveTo(fe_scene["frames"][frame][p]["x"], fe_scene["frames"][frame][p]["y"]); //try to draw a line
            canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]);

            if (fe_scene["frames"][frame+5][p]["x"]<fe_scene["frames"][frame][p]["x"] && fe_scene["frames"][frame][p]["y"] < fe_scene["frames"][frame+5][p]["y"]) { 
              canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]-10);
              canv_main_obj.moveTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]);
              canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"]+10, fe_scene["frames"][frame+5][p]["y"]); 
              }
              else if(fe_scene["frames"][frame+5][p]["x"]>fe_scene["frames"][frame][p]["x"] && fe_scene["frames"][frame][p]["y"] < fe_scene["frames"][frame+5][p]["y"]) { 
                canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]-10);
                canv_main_obj.moveTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]);
                canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"]-10, fe_scene["frames"][frame+5][p]["y"]);
                }
                else if (fe_scene["frames"][frame+5][p]["x"]<fe_scene["frames"][frame][p]["x"] && fe_scene["frames"][frame][p]["y"] > fe_scene["frames"][frame+5][p]["y"]) {
                canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]+10);
                canv_main_obj.moveTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]);
                canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"]+10, fe_scene["frames"][frame+5][p]["y"]);  
                }
                else if (fe_scene["frames"][frame+5][p]["x"]>fe_scene["frames"][frame][p]["x"] && fe_scene["frames"][frame][p]["y"] > fe_scene["frames"][frame+5][p]["y"]) {
                  canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]+10);
                  canv_main_obj.moveTo(fe_scene["frames"][frame+5][p]["x"], fe_scene["frames"][frame+5][p]["y"]);
                  canv_main_obj.lineTo(fe_scene["frames"][frame+5][p]["x"]-10, fe_scene["frames"][frame+5][p]["y"]);  
                  }
            canv_main_obj.stroke();
          }
        }
      }
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
    canv_ent_obj[id].stroke();  // Рисуем круг
  }
  
  // == Преобразование rgb в hex код цвета == //
  function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16);
  }
  
})(jQuery);