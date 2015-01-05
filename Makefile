test:
	@./node_modules/.bin/mocha --bail\
		test/yukon.test.js

.PHONY: test 