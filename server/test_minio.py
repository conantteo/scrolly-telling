from minio import Minio
import os

s3_client = Minio(
    endpoint=os.getenv("S3_ENDPOINT", "localhost:9000"),
    access_key=os.getenv("S3_ACCESS_KEY", "minio"),
    secret_key=os.getenv("S3_SECRET_KEY", "minio123"),
    secure=False,
    region=os.getenv("S3_REGION", ""),
)
def test():
    with open("test.txt", "w") as f:
        f.write("test")
    source_file = "./test.txt"
    bucket_name = "testminio"
    destination_file = "my-test-file.toml"
    found = s3_client.bucket_exists(bucket_name)

    if not found:
        s3_client.make_bucket(bucket_name)
        print("Created bucket", bucket_name)

    s3_client.fput_object(
        bucket_name, destination_file, source_file,
    )

    print(
        source_file, "successfully uploaded as object",
        destination_file, "to bucket", bucket_name,
    )
    os.remove("test.txt")