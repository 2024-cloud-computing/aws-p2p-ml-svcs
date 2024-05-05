import pymysql
import os

class MySQLConn:
    def __init__(self):
        self.user = "root"
        self.host = os.environ.get('DB_HOST', "localhost")
        self.password = os.environ.get('DB_PASSWORD', "")
        self.conn = pymysql.connect(
            host=self.host,
            port=3306,
            user=self.user,
            password=self.password,
        )
        self.conn.cursor().execute("CREATE DATABASE IF NOT EXISTS CloudComputing")
        self.conn.select_db("CloudComputing")

    def create_table(self):
        cursor = self.conn.cursor()
        create_table = """
        CREATE TABLE IF NOT EXISTS Users (
            username VARCHAR(200),
            password VARCHAR(200),
            firstname VARCHAR(200),
            lastname VARCHAR(200)
        )
        """
        cursor.execute(create_table)

    def insert_user(self, username, password, firstname, lastname):
        cur = self.conn.cursor()
        cur.execute(
            "INSERT INTO Users(username, password, firstname, lastname) VALUES(%s, %s, %s, %s)",
            (username, password, firstname, lastname))
        self.conn.commit()
        cur.close()

    def check_user(self, username):
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM Users WHERE username=%s", (username))
        result = cur.fetchall()
        cur.close()
        return len(result) == 0
    
    def auth_user(self, username, password):
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM Users WHERE username=%s AND password=%s", (username, password))
        result = cur.fetchall()
        cur.close()
        return len(result) != 0

if __name__ == "__main__":
    conn = MySQLConn()
    conn.create_table()
