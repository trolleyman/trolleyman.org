## Main build
FROM ubuntu:latest
RUN apt-get update && apt-get install -y --no-install-recommends\
    libssl-dev

# Install trolleyman.org
RUN mkdir -p /trolleyman.org
WORKDIR /trolleyman.org
COPY ./target/dist /trolleyman.org/
COPY ./scripts/docker_entrypoint.sh ./
RUN rm -f /trolleyman.org/data/restart_flag

EXPOSE 80 443
VOLUME /trolleyman.org/logs
VOLUME /trolleyman.org/data

ENTRYPOINT ["./docker_entrypoint.sh"]
CMD ["./trolleyman-org"]
