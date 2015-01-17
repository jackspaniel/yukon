test:	
	@./node_modules/.bin/mocha --bail --check-leaks\
		--require test/env\
		--reporter spec\
		test/yukon*.test.js

test-cov:
	@NODE_ENV=test node \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		test/yukon*.test.js \
		--bail

test-travis:
	@NODE_ENV=test node \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		test/yukon.test.js \
		--bail

.PHONY: test 