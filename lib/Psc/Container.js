define(['jquery', 'joose', 'translator', 'Psc/Errors', 'Psc/UI/Translating', 'Psc/TPL/TemplatesRenderer'], function ($, Joose, translator, Errors) {
  Joose.Class('Psc.Container', {

    does: [Psc.UI.Translating],

    has: {
      templatesRenderer: { is: 'rw', required: false, isPrivate: true},

      navigationService: { is: 'rw', required: true, isPrivate: true},
      translator: { is: 'rw', required: false, isPrivate: true},
      errors: { is: 'rw', required: false, isPrivate: true}
    },
    
    after: {
      initialize: function (props) {
        if (!props.templatesRenderer) {
          this.$$templatesRenderer = new Psc.TPL.TemplatesRenderer();
        }

        this.$$translator = translator; // jquery Global in translator kann nicht injected werden?
      }
    },
    
    methods: {
      getErrors: function () {
        if (!this.$$errors) {
          this.$$errors = new Errors();
        }

        return this.$$errors;
      },

      setLocale: function (locale) {
        this.$$translator.setLocale(locale);
      },
      toString: function () {
        return '[Psc.Container]';
      }
    }
  });
});