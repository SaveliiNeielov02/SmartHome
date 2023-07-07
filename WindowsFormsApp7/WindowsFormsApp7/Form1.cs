using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using System.Windows.Forms;
using System.Windows.Forms.DataVisualization.Charting;
using Newtonsoft.Json;
namespace WindowsFormsApp7
{
    public partial class Form1 : Form
    {
        Series series = new Series("Температура");

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            chart1.Series.Add(series);
            series.ChartType = SeriesChartType.Line;
            chart1.Series["Температура"].Color = Color.Orange;
            chart1.Series["Температура"].BorderWidth = 4;
            chart1.ChartAreas[0].AxisX.Title = "Время";
            chart1.ChartAreas[0].AxisY.Title = "Температура";
            textBox1.Text = "-1";
            textBox2.Text = "-1";
            var thresholdsTimer = new System.Timers.Timer();
            thresholdsTimer.Interval = 4000;
            thresholdsTimer.Elapsed += ThresholdsTimerElapsed;
            thresholdsTimer.Elapsed += TemperatureTimerElapsed;
            thresholdsTimer.Start();
        }
        private async void GetTresholds(string lowerTreshold, string upperTreshold)
        {
            using (var client = new HttpClient())
            {
                var content = new StringContent(
                    JsonConvert.SerializeObject(lowerTreshold.ToString() + " " + upperTreshold.ToString()));
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response = await client.PostAsync("http://127.0.0.1:5000/setTresholds", content);
                var tresholdsValues = JsonConvert.DeserializeObject(
                   await response.Content.ReadAsStringAsync()).ToString().Split(' ');
                Invoke((Action)(() =>
                {
                    var currentLowerTreshold = textBox1.Text;
                    var currentUpperTreshold = textBox2.Text;
                    textBox1.Text = textBox1.Focused ? currentLowerTreshold : tresholdsValues[0];
                    textBox2.Text = textBox2.Focused ? currentUpperTreshold : tresholdsValues[1];
                }));

            }

        }
        private async void GetTemperature() 
        {
            using (var client = new HttpClient())
            {
                var response = await client.GetAsync("http://127.0.0.1:5000/getTemperature");
                string[] responseMessage = JsonConvert.DeserializeObject(
                   await response.Content.ReadAsStringAsync()).ToString().Split(' ');
                Invoke((Action)(() =>
                {
                    chart1.ChartAreas[0].AxisY.StripLines.Clear();

                    int lower = int.Parse(textBox1.Text);
                    StripLine lowerTreshold = new StripLine();
                    lowerTreshold.Interval = 0; 
                    lowerTreshold.IntervalOffset = lower; 
                    lowerTreshold.StripWidth = 0.3; 
                    lowerTreshold.BackColor = Color.Blue; 
                    chart1.ChartAreas[0].AxisY.StripLines.Add(lowerTreshold);

                    int upper = int.Parse(textBox2.Text);
                    StripLine upperTreshold = new StripLine();
                    upperTreshold.Interval = 0; 
                    upperTreshold.IntervalOffset = upper; 
                    upperTreshold.StripWidth = 0.3; 
                    upperTreshold.BackColor = Color.Red; 
                    chart1.ChartAreas[0].AxisY.StripLines.Add(upperTreshold);

                    label6.Text = responseMessage[0];
                    chart1.Series["Температура"].Points.AddXY(responseMessage[2], responseMessage[0]);
                    chart1.Series["Температура"].Points.Last().Label = responseMessage[0];
                    chart1.Series["Температура"].Points.Last().Font = new Font(chart1.Series["Температура"].Points.Last().Font, FontStyle.Bold);
                    label4.Text = responseMessage[1];
                }));
            }
        }
        private void ThresholdsTimerElapsed(object sender, ElapsedEventArgs e)
        {
            GetTresholds("-1", "-1");
        }
        private void TemperatureTimerElapsed(object sender, ElapsedEventArgs e)
        {
            GetTemperature();
        }
        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            GetTresholds(textBox1.Text, textBox2.Text);
        }
    }
}
