# ~/a/pilgrimsWebApp
help: ; @cat ./makefile
.PHONY: hexo upload-hexo watch bundle upload merge
GCS_BUCKET_DIR = gs://crowley.pw/pilgrimsApp/
CACHE_CONTROL = -h "Cache-Control:private, max-age=0, no-transform"
hexo:
	hexo clean
	hexo generate
	hexo serve --draft
upload-hexo:
	hexo clean
	hexo generate
	gsutil -m $(CACHE_CONTROL) rsync -e -r public/ $(GCS_BUCKET_DIR)

watch:
	watchify lib/main.js -d -o public/bundle.js -v
bundle:
	browserify lib/main.js -d -o public/bundle.js -v
upload:
	browserify lib/main.js -d -o public/bundle.js -v
	gsutil -m rsync -e -r public/ $(GCS_BUCKET_DIR)
merge:
	echo '-----merge';git checkout master;git merge work;git branch -d work
	echo '-----push';git push;echo '-----co work';git checkout -b work;git status
