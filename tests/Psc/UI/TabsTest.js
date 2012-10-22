define(['psc-tests-assert','Psc/UI/Tabs','Psc/UI/Tab','Psc/UI/Menu'], function() {
  var tab = new Psc.UI.Tab({
    id: 'entity-persons-17',
    label: 'Philipp S',
    url: '/entities/persons/17/form'
  });
  var otherTab = new Psc.UI.Tab({
    id: 'entity-persons-19',
    label: 'IS',
    url: '/entities/persons/19/form'
  });
  
  var loadFixture = function(assertions) {
    return function () {
      $.get('/js/fixtures/tabs.php', function (html) {
        var $fixture = $('#qunit-fixture').html(html);
        var $tabs = $fixture.find('div.psc-cms-ui-tabs');
        this.assertEquals($tabs.length,1,'self-test: Fixture hat div.psc-cms-ui-tabs im html des Ajax Requests');
      
        var tabs = new Psc.UI.Tabs({ widget: $tabs });
        this.assertSame($tabs, tabs.unwrap());
        
        this.assertions($tabs, tabs);
      }, 'html');
    };
  };
  
  module("Psc.UI.Tabs");
  
  asyncTest("tab parsing", loadFixture(function ($tabs, tabs) {
    var welcome;
    // check welcome tab (parsing)
    this.assertInstanceOf(Psc.UI.Tab, welcome = tabs.tab({index: 0}));
    this.assertEquals('Willkommen', welcome.getLabel());
    this.assertEquals('tab-content0', welcome.getId());
    this.assertFalse(welcome.isClosable(),'welcome cannot be closed');
    
    this.assertEquals(0, tabs.getIndex());
    this.assertEquals(1, tabs.count());
    start();
  }));
    
  asyncTest("has", loadFixture(function ($tabs, tabs) {
    // has
    this.assertFalse(tabs.has(),'has with empty');
    this.assertFalse(tabs.has({index: null}),'has() returns false with null as index');
    this.assertFalse(tabs.has({index: 2}),'has() returns false with not-existing index');
    this.assertTrue(tabs.has({index: 0}),'has() returns true with existing index');
    start();
  }));
  
  asyncTest("add a tab and get his index", loadFixture(function ($tabs, tabs) {
    tabs.add(tab);
    this.assertTrue(tab.isClosable(),'normal tab is closable');    
    
    // index + count
    this.assertEquals(1, tabs.getIndex());
    this.assertEquals(2, tabs.count());
    this.assertEquals(1, tabs.getIndex(tab));
  
    // now it has the tab
    this.assertTrue(tabs.has(tab));
    
    // but not another
    this.assertFalse(tabs.has(otherTab));
    start();
  }));
  
  
  asyncTest("close and isClosable", loadFixture(function ($tabs, tabs) {
    tabs.add(tab);
    this.assertTrue(tab.isClosable(),'normal tab is closable');
    
    this.assertFalse(tabs.tab({index:0}).isClosable(), 'welcome tab is not closable');
    start();
  }));
  
  asyncTest("search for a tab", loadFixture(function ($tabs, tabs) {
    tabs.add(tab);
    
    // search
    this.assertSame(tab, tabs.tab({id: 'entity-persons-17'}));
    this.assertSame(tab, tabs.tab({index: tabs.getIndex()}));
    
    raises(function () {
      tabs.tab({id: 'none'});
    });
    raises(function () {
      tabs.tab({index: 2});
    });
    raises(function () {
      tabs.tab({index: -1});
    });
    start();
  }));
  
  asyncTest("search for tab with special chars", loadFixture(function ($tabs, tabs) {
    start();
    var spTab = new Psc.UI.Tab({"id":"entities-user-info@ps-webforge.comd-form",
          "label":"Psc\\Doctrine\\Entity<Entities\\User> [info@ps-webforge.comd]",
          "url":"\/entities\/user\/info@ps-webforge.comd\/form"}
        );
    
    tabs.add(spTab);
    this.assertSame(spTab, tabs.tab({id: 'entities-user-info@ps-webforge.comd-form'}));
  }));
    
  asyncTest("select a tab and open adds and selects tabs", loadFixture(function ($tabs, tabs) {
    tabs.add(tab);
    var selected = function() {
      return $tabs.tabs('option','selected');
    };
    
    // select
    this.assertEquals(0, selected(), 'pre-condition: nativer index entspricht nicht dem erwarteten');
    tabs.select(tab);
    // native test
    this.assertEquals(1, selected(), 'nativer index entspricht nicht dem erwarteten');
    
    // "open" a new tab. the first one just adds it
    tabs.open(otherTab);
    this.assertEquals(2, tabs.getIndex(otherTab));
    
    // tab is not selected
    this.assertEquals(1, selected(), 'nativer index ist noch 1');
    // tab is added
    this.assertEquals(3, tabs.count()); // tab,othertab,welcome
    this.assertTrue(tabs.has(otherTab),'has() gibt für den open tab true zurück');
    // native test isSelected?
    this.assertEquals(1, $tabs.find('ul li a[href="#entity-persons-19"]').length,' tab wurde geöffnet und hinzugefügt (dom)');
    
    //  "open" the second selects it
    tabs.open(otherTab);
    this.assertEquals(2, selected(),'tab was selected the second time');
    start();
  }));
  
  asyncTest("has searches by id not by reference", loadFixture(function ($tabs, tabs) {
    start();
    tabs.add(tab);
    
    var sameTab = new Psc.UI.Tab({
      id: tab.getId(),
      label: tab.getLabel(),
      url: tab.getUrl()
    });
    
    this.assertTrue(tabs.has(sameTab), 'sameTab is (with the same id) in tabs');
  }));
  
  asyncTest("mark tabs unsaved and saved. ", loadFixture(function ($tabs, tabs) {
    tabs.add(tab);
    tabs.add(otherTab);
    
    // mark unsaved and then saved
    this.assertFalse(tab.isUnsaved());
    tabs.unsaved(tab);
    this.assertTrue(tab.isUnsaved());
    tabs.saved(tab);
    this.assertFalse(tab.isUnsaved());
    
    // close from code (tab)
    tabs.close(tab);
    this.assertEquals(2, tabs.count());
    
    // close from click (otherTab), otherTab wurde ganz sicher hinzugefügt, d.h. die eventhandler klappen auch für sich veränderne elemente
    $tabs.find('ul li a[href="#entity-persons-19"]').nextAll('span.ui-icon-close').trigger('click');
    this.assertEquals(1, tabs.count(),'count ist jetzt 1 nachdem auf close gelickt wurde');
    start();
  }));
  
  asyncTest("tabsAll closes (nearly) all tabs", loadFixture(function ($tabs, tabs) {
    start();
    tabs.add(tab);
    tabs.add(otherTab);
    this.assertEquals(3, tabs.count(),'3 tabs are there (1 fixture + 2 real)'); // 3 denn auch welcome
    
    tabs.closeAll();
    this.assertEquals(1, tabs.count(),'1 tabs is avaible after closeAll() because it is not closable');
    this.assertFalse(tabs.tab({index:0}).isClosable(), 'tab is really not closable');
  }));
  
  asyncTest("tabs gets added with contextMenu", loadFixture(function ($tabs, tabs) {
    tabs.add(tab);
    start();
    
    this.assertEquals(2, tabs.count(),'tabs count is 2');
    var $li = $tabs.find('li:has(a[href="#entity-persons-17"])');
    var $span = $li.find('span.options');
    this.assertEquals(1, $span.length, 'options span gefunden');
    
    // is registered in manager
    var menu = tabs.getContextMenuManager().get($span);
    
    this.assertInstanceOf(Psc.UI.Menu, menu);
  }));
  
  asyncTest("tabs gets parsed with contextMenu", loadFixture(function ($tabs, tabs) {
    start();
    // nehme das fixture aus index.php (denn dashat 3 tabs sogar buttons)
    tabs = new Psc.UI.Tabs({ widget: fixtures.loadHTML('ui-tabs') });
    $tabs = tabs.unwrap();
    
    var $li = $tabs.find('li:has(a[href="#tabs-3"])');
    var $span = $li.find('span.options');
    this.assertEquals(1, $span.length, '.options span in fixture gefunden');
    
    var menu = tabs.getContextMenuManager().get($span);
    this.assertInstanceOf(Psc.UI.Menu, menu);
    
    $span.trigger('click');
  }));
  
  test("tabs trigger remote-tab-loaded after loading a remote tab with success", function() {
    fail('todo');
  });

  test("tabs trigger remote-tab-load before loading a remote tab", function() {
    fail('todo');
  });
});
