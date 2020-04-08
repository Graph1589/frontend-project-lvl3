install:
	npm install

develop:
	npx webpack-dev-server

build:
	rm -rf dist
	NODE_ENV=productions npx webpack

test:
	npm test

lint:
	npx eslint .

publish:
	npm publish

	