'use strict';

describe('Pictures E2E Tests:', function() {
	describe('Test Pictures page', function() {
		it('Should not include new Pictures', function() {
			browser.get('http://localhost:3000/#!/pictures');
			expect(element.all(by.repeater('picture in pictures')).count()).toEqual(0);
		});
	});
});
