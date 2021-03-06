describe('timepicker directive', function () {
  var scope, el, ezScope, input, $httpBackend;

    var minuteStep = 15;
  beforeEach(module('ez.timepicker'));
  beforeEach(module('ui.bootstrap'));
  beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
    $compile = _$compile_;
    scope = _$rootScope_;
    scope.form = {time: null};

    el = angular.element('<div ez-timepicker="form.time"><input id="timeInput" name="test_time" ng-model="form.time"/></div>');

		template = $templateCache.get('src/template/ez-timepicker.html');
		$templateCache.put('ez-timepicker.html', template);

    $compile(el)(scope);

    scope.$digest();
    input = el.find('#timeInput');
  }));

  var timeToString = function(hours, minutes, meridian) {
    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    return hours + ':' + minutes + ' ' + meridian;
  };

  var setInput = function(val) {
    input.val(val).trigger('input').trigger('blur');
  }

  function mouseWheel(element, delta) {
    var e = $.Event('mousewheel');
    e.wheelDelta = delta;
    element.trigger(e);
  }

  function wheel(element, delta) {
    var e = $.Event('wheel');
    e.deltaY = -delta;
    element.trigger(e);
  }

  it('should add the widget template', function() {
    expect(el.find('.dropdown-menu').length).toBe(1);
  });

  it('should open & close widget on button toggle', function() {
    el.find('.input-group-btn a').click();
    expect(el.hasClass('open')).toBe(true);

    el.find('.input-group-btn a').click();
    expect(el.hasClass('open')).toBe(false);
  });

  it('should close widget on click outside', function() {
    el.find('.input-group-btn a').click();
    expect(el.hasClass('open')).toBe(true);

    angular.element('body').click();
    expect(el.hasClass('open')).toBe(false);

    // repeat to make sure events get rebound
    el.find('.input-group-btn a').click();
    expect(el.hasClass('open')).toBe(true);

    angular.element('body').click();
    expect(el.hasClass('open')).toBe(false);
  });

  it('should have current time by default', function() {
    var dTime = new Date(),
        hours = dTime.getHours(),
        minutes = dTime.getMinutes(),
        meridian;

    if (minutes !== 0) {
      minutes = Math.ceil(minutes / minuteStep) * minuteStep;
    }

    if (minutes === 60) {
      hours += 1;
      minutes = 0;
    }

    if (hours < 12) {
      meridian = 'AM';
    } else {
      meridian = 'PM';
    }

    if (hours > 12) {
      hours = hours - 12;
    }
    if (hours === 0) {
      hours = 12;
    }

    expect(scope.form.time).toEqual(timeToString(hours, minutes, meridian));
  });

  it('should handle stupid input from users', function() {
    setInput('10p');
    expect(scope.form.time).toEqual('10:00 PM');

    setInput('3a');
    expect(scope.form.time).toEqual('3:00 AM');

    setInput('1');
    expect(scope.form.time).toEqual('1:00 AM');

    setInput('13');
    expect(scope.form.time).toEqual('1:00 PM');

    setInput('10:20p');
    expect(scope.form.time).toEqual('10:30 PM');

    setInput('1020p');
    expect(scope.form.time).toEqual('10:30 PM');

    setInput('1020am');
    expect(scope.form.time).toEqual('10:30 AM');

    setInput('2320am');
    expect(scope.form.time).toEqual('11:30 PM');

    setInput('0');
    expect(scope.form.time).toEqual('12:00 AM');
  });

  it('should increment/decrement hours on click', function() {
    setInput('11:00 AM');

    el.find('.hours-col a')[0].click();
    expect(scope.form.time).toEqual('12:00 PM');

    el.find('.hours-col a')[1].click();
    expect(scope.form.time).toEqual('11:00 AM');
  });

  it('should increment/decrement hours on scroll', function() {
    setInput('11:00 AM');
    el.find('.input-group-btn a').click();
    expect(el.hasClass('open')).toBe(true);

    wheel(el.find('.hours-col'), 1);
    expect(input.val()).toEqual('12:00 PM');

    mouseWheel(el.find('.hours-col'), -1);
    expect(scope.form.time).toEqual('11:00 AM');
  });

  it('should increment/decrement minutes on scroll', function() {
    setInput('11:45 AM');
    el.find('.input-group-btn a').click();

    wheel(el.find('.minutes-col'), 1);
    expect(scope.form.time).toEqual('12:00 PM');

    mouseWheel(el.find('.minutes-col'), -1);
    expect(scope.form.time).toEqual('11:45 AM');
  });

  it('should increment/decrement minutes on click', function() {
    setInput('11:30 AM');

    el.find('.minutes-col a')[0].click();
    expect(scope.form.time).toEqual('11:45 AM');

    el.find('.minutes-col a')[1].click();
    expect(scope.form.time).toEqual('11:30 AM');
  });

  it('should toggle meridian minutes on click', function() {
    setInput('11:30 AM');

    el.find('.meridian-col a')[0].click();
    expect(scope.form.time).toEqual('11:30 PM');

    el.find('.meridian-col a')[1].click();
    expect(scope.form.time).toEqual('11:30 AM');
  });

  it('should show time in the widget & update on time change', function() {
    setInput('10:15 AM');

    expect(el.find('.hours-val').text()).toBe('10');
    expect(el.find('.minutes-val').text()).toBe('15');
    expect(el.find('.meridian-val').text()).toBe('AM');

    el.find('.minutes-col a')[0].click();

    expect(el.find('.hours-val').text()).toBe('10');
    expect(el.find('.minutes-val').text()).toBe('30');
    expect(el.find('.meridian-val').text()).toBe('AM');
  });
});
