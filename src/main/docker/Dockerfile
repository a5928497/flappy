FROM openjdk:8-jdk-alpine
ENV TIME_ZONE Asia/Shanghai
ARG FINAL_NAME
RUN \
sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN mkdir -p /app
ADD ${FINAL_NAME} /app/
RUN \
apk update \
&& apk add --no-cache tzdata \
&& echo "${TIME_ZONE}" > /etc/timezone \
&& cp -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime \
&& mkdir -p /data \
&& chmod +x /app/bin/start.sh \
&& rm -fr /tmp/* \
&& rm -rf /var/cache/apk/*
VOLUME /data
EXPOSE 8080
WORKDIR /app/
ENTRYPOINT ["./bin/start.sh"]

