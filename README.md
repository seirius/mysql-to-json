# mysql-to-json

Exports data from a table to a json.

## Installing

```npm install -g https://github.com/seirius/mysql-to-json```

## Using

The next line will create a JSON file with name `table_name.json` in the current directory. If you want to output to a custom directory use `--output`.
```mtj --host localhost --port 3306 --database database_name --table table_name --user username --password user_password```

In case you just want to print to the console, add `--print`.
If you want to limit the query to a fixed number of results, user `--limit number_of_results`.


For more information use `mtj --help`.
