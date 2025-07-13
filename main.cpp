#include <iostream>
#include <fstream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    string name, roll, email, gender, category;
    double income, marks, extracurricular;
    int rank;
    double score;
};

vector<Student> readCSV(const string& filename) {
    vector<Student> students;
    ifstream file(filename);
    string line;
    getline(file, line); // skip header
    while (getline(file, line)) {
        stringstream ss(line);
        string item;
        Student s;
        getline(ss, s.name, ',');
        getline(ss, s.roll, ',');
        getline(ss, s.email, ',');
        getline(ss, s.gender, ',');
        getline(ss, s.category, ',');
        getline(ss, item, ','); s.income = stod(item);
        getline(ss, item, ','); s.marks = stod(item);
        getline(ss, item, ','); s.rank = stoi(item);
        getline(ss, item, ','); s.extracurricular = stod(item);
        students.push_back(s);
    }
    return students;
}

void writeCSV(const string& filename, const vector<Student>& students) {
    ofstream file(filename);
    file << "name,roll,email,gender,category,income,marks,rank,extracurricular,score\n";
    for (const auto& s : students) {
        file << s.name << "," << s.roll << "," << s.email << "," << s.gender << "," << s.category << ","
             << s.income << "," << s.marks << "," << s.rank << "," << s.extracurricular << "," << s.score << "\n";
    }
}

int main() {
    vector<Student> students = readCSV("students.csv");
    // Example: Calculate score for each student
    for (auto& s : students) {
        s.score = s.marks * 0.4 - s.income * 0.3 + s.extracurricular * 0.1; // Example weights
    }
    // Sort by score descending
    sort(students.begin(), students.end(), [](const Student& a, const Student& b) {
        return a.score > b.score;
    });
    // Write results
    writeCSV("results.csv", students);
    cout << "Processed " << students.size() << " students. Results saved to results.csv\n";
    return 0;
}
