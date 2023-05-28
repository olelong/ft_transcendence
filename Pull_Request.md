# Pull Requests

The master branch is protected, so any updates require a pull request. To do so, please follow these steps :
* If you are not a contributor of the CatOrganisation, fork this repository.
* Clone this repository (or yours if you forked it) to your local machine:
```bash
git clone https://github.com/CatOrganisation/ft_transcendence.git
```
* Navigate to the `dev` branch of the cloned repository:
```bash
cd ft_transcendence
git checkout dev
```
* Please refer to the [README.md](README.md) file for instructions on how to add the .env files, but keep in mind that there are differences in the file locations:
	* The .env file located at the root should be moved to the `srcs` folder.
	* The .env file located in the `nest` folder should be moved to the `srcs/requirements/nest/server` folder.
* Compile using GNU Make (note that `make clean` will stop your containers and `make fclean` will clean **all** your docker data):
```bash
make
```
* Code/fix what you want by taking advantage of the hot reload.
* Commit and push your changes.
* Now, you have to copy the `src` folders of the `react` and `nest` services to the `prod` branch, ignoring the changes of the `main.ts` file to not include the hot reload. To do this, you can simply use the `push_to_prod.sh` script:
```bash
./push_to_prod.sh
```
* Once done, make a new pull request from your `prod` branch to the `master` branch.

Once your pull request is accepted and I, [whazami](https://github.com/whazami), sync my forked repository with the main project, your modifications will be visible on the [deployed](https://cat-pong.com) version of the project.
