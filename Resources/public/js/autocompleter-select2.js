(function ($) {
    'use strict';
    $.fn.autocompleter = function (options) {
        var settings = {
            url_list: '',
            url_get: '',
            placeholder: '',
            multiple: false,
            otherOptions: {minimumInputLength: 2}
        };
        return this.each(function () {
            if (options) {
                $.extend(true, settings, options);
            }
            var $this = $(this);
            var $fakeInput = $this.clone();
            var vals = [];
            var initVal = typeof $this.attr('value') === 'undefined' ? '' : $this.attr('value');
            $.ajax({
                url: (settings.url_get.substring(-1) === '/' ? settings.url_get : settings.url_get + '/') + initVal,
                success: function (data) {
                    $.each(data, function (index, item) {
                        vals.push({
                            id: item.id,
                            text: item.text
                        });
                    });
                    var select2options = {
                        ajax: {
                            url: settings.url_list,
                            dataType: 'json',
                            delay: 250,
                            placeholder: settings.placeholder,
                            data: function (params) {
                                return {
                                    q: params
                                };
                            },
                            results: function (data) {
                                var results = [];
                                $.each(data, function (index, item) {
                                    results.push({
                                        id: item.id,
                                        text: item.text
                                    });
                                });
                                return {
                                    results: results
                                };
                            },
                            cache: true
                        },
                        escapeMarkup: function (markup) {
                            return markup;
                        },
                        initSelection: function (element, callback) {
                            var data = [];
                            vals.forEach(function (el) {
                                data.push({id: el.id, text: el.text});
                            });
                            callback(settings.multiple == false ? data[0] : data);
                        }
                    };
                    $this.removeAttr('required');
                    $fakeInput.removeAttr('required');
                    if (settings.otherOptions) {
                        $.extend(true, select2options, options.otherOptions);
                    }
                    $fakeInput.attr('id', 'fake_' + $fakeInput.attr('id'));
                    $fakeInput.attr('name', 'fake_' + $fakeInput.attr('name'));
                    $this.hide().after($fakeInput);
                    $fakeInput.select2(select2options);
                    $fakeInput.on('change', function (e) {
                        console.log('$fakeInput change');
                        $this.val(e.val).change();
                    });
                }
            });

        });
    };
})(jQuery);
