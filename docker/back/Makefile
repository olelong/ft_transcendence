all:
	docker-compose -f srcs/docker-compose.yml up -d --build

clean:
	docker-compose -f srcs/docker-compose.yml down

.ONESHELL: # For Heredoc
fclean:
	@echo Stopping containers...
	@-docker stop $$(docker ps -q)
	@-docker rm $$(docker ps -aq)
	@-docker network rm $$(docker network ls -q) 2> /dev/null
	@-docker volume rm $$(docker volume ls -q)
	@-docker image rm $$(docker images -q)
	@docker system prune << EOF
	y
	EOF

re: clean all

.PHONY: all clean fclean re
