if [ -n "$(git status --porcelain)" ]; then
		echo "Your tree isn't clean, please commit your modifications."
		exit 1
fi

if [ -n "$(git log origin/dev..dev)" ]; then
		echo "Some commits are not pushed, please perform a 'git push'."
		exit 1
fi

last_dev_commit=$(git log -1 --pretty=%B)

nestcp=$(mktemp -d)
reactcp=$(mktemp -d)
cp -r srcs/requirements/nest/server/src/* $nestcp
cp -r srcs/requirements/react/app/src/* $reactcp

git checkout prod

cp -r $nestcp/* nest/src
cp -r $reactcp/* react/src

git restore nest/src/main.ts

git add *
git commit -m "From dev: $last_dev_commit"

git push origin prod

rm -rf $nestcp
rm -rf $reactcp
