using ConsoleApp2.Models;
using ConsoleApp2.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using System.Text.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;



namespace MyApp
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Task task = new Task(() =>
            {
                Thread.Sleep(2000);
                Console.WriteLine("Task");
            });
            
            Console.WriteLine("Main thread");
            task.Start();
            await task;
            Console.WriteLine("After task1");
            Console.WriteLine("After task2");
            //var configuration = new ConfigurationBuilder()
            //    .AddJsonFile("appsettings.json")
            //    .Build();

            //string connectionString = configuration.GetConnectionString("DefaultConnection")
            //    ?? throw new InvalidOperationException("Connection string not found");

            //Computer c1 = new Computer
            //{
            //    Motherboard = "ASUS ROG Strix Z590-E",
            //    CPUCores = 8,
            //    HasWifi = true,
            //    ReleaseDate = new DateTime(2021, 5, 15),
            //    Price = 699.99m,
            //    VideoCard = "NVIDIA GeForce RTX 3080"
            //};

            //DataContextDapper dataContext = new DataContextDapper();
            //DataContextEF dataContextEF = new DataContextEF(connectionString);

            // Inserting data using Dapper
            //string insertSqlCommand = $@"
            //    INSERT INTO MyAppSchema.computer (Motherboard, CPUCores, HasWifi, ReleaseDate, Price, VideoCard)
            //    VALUES ('{c1.Motherboard}', {c1.CPUCores}, {(c1.HasWifi ? 1 : 0)}, '{c1.ReleaseDate:yyyy-MM-dd}', {c1.Price}, '{c1.VideoCard}' )
            //";

            //int rowsInserted = dataContext.ExecuteWithCount(insertSqlCommand);
            //Console.WriteLine("Rows inserted: " + rowsInserted);

            // Retrieving data using Dapper
            //string selectSqlCommand = "SELECT * FROM MyAppSchema.computer";
            //List<Computer> computers = dataContext.LoadData<Computer>(selectSqlCommand).ToList();

            //foreach(var computer in computers)
            //{
            //    Console.WriteLine($"ID: {computer.ComputerId}, Motherboard: {computer.Motherboard}, CPU Cores: {computer.CPUCores}, Has Wifi: {computer.HasWifi}, Release Date: {computer.ReleaseDate.ToShortDateString()}, Price: {computer.Price}, Video Card: {computer.VideoCard}");
            //}

            // Inserting data using Entity Framework
            //dataContextEF.Add(c1);
            //dataContextEF.SaveChanges();

            //IEnumerable<Computer> computersEF = dataContextEF.Set<Computer>().ToList();
            //foreach (Computer computer in computersEF)
            //{
            //    Console.WriteLine($"ID: {computer.ComputerId}, Motherboard: {computer.Motherboard}, CPU Cores: {computer.CPUCores}, Has Wifi: {computer.HasWifi}, Release Date: {computer.ReleaseDate.ToShortDateString()}, Price: {computer.Price}, Video Card: {computer.VideoCard}");

            //}

            // Reading and Writing from/to a file
            //string text = "Hello, this is a sample text to be written to a file.";
            //File.WriteAllText("sample.txt", text);

            //using StreamWriter writer = new("sample.txt", append: true);
            //writer.WriteLine("\nThis line is appended to the file.");
            //writer.Close();

            //string readText = File.ReadAllText("sample.txt");
            //Console.WriteLine(readText);

            // Serializing and Deserializing (We can do by using built in System.Text.Json or with package Newtonsoft.Json)

            //string computersJson = File.ReadAllText("Computers.json");
            //Console.WriteLine(computersJson);

            // Deserizliaing using System.Text.Json

            //JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions()
            //{
            //    PropertyNamingPolicy = JsonNamingPolicy.CamelCase // We need this option for both serialization and deserialization to match the property names in the JSON file with the C# class properties when using System.Text.Json.
            //};

            // IEnumerable<Computer>? computers = System.Text.Json.JsonSerializer.Deserialize<IEnumerable<Computer>>(computersJson, jsonSerializerOptions)
            //                     ?? throw new InvalidOperationException("Deserialization failed");

            // if (computers != null)
            // {
            //     foreach (Computer computer in computers)
            //     {
            //         Console.WriteLine(computer.Motherboard);
            //     }
            // }

            // // Serizlizing using System.Text.Json
            // IEnumerable<Computer> computersEF1 = dataContextEF.Set<Computer>().ToList();
            // string computersCopySystem = System.Text.Json.JsonSerializer.Serialize(computersEF1, jsonSerializerOptions);
            // File.WriteAllText("ComputersCopySystem.json", computersCopySystem);

            // JsonSerializerSettings settings = new JsonSerializerSettings()
            // {
            //     ContractResolver = new CamelCasePropertyNamesContractResolver()
            // };

            // // Deserializing using Newtonsoft.Json
            // IEnumerable<Computer>? computers1 = Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<Computer>>(computersJson)
            //                     ?? throw new InvalidOperationException("Deserialization failed");
            // if (computers1 != null)
            // {
            //     foreach (Computer computer in computers1)
            //     {
            //         Console.WriteLine(computer.Motherboard);
            //     }
            // }

            // Serializing using Newtonsoft.Json
            //IEnumerable<Computer> computersEF2 = dataContextEF.Set<Computer>().ToList();
            //string computersCopyNewtonsoft = Newtonsoft.Json.JsonConvert.SerializeObject(computersEF2, settings);
            //File.WriteAllText("ComputersCopyNewtonsoft.json", computersCopyNewtonsoft);


        }
    }
}