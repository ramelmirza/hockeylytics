import { StatusBar } from 'expo-status-bar';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {useEffect, useState} from 'react';
import { Table, Row, Rows } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';

export default function App() {
    const [statItems, setStatItems] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // For new data
    const [dateField, setDateField] = useState("");
    const [opponentField, setOpponentField] = useState("");
    const [goalField, setGoalField] = useState("");
    const [assistsField, setAssistsField] = useState("");
    const [shotField, setShotField] = useState("");

    // Get stats on first application load
    useEffect(() => {
        loadStats();
    }, []);

    // Get all items in the db
    async function loadStats() {
        try {
            const response = await axios.get('http://localhost:3001/api/');
            console.log(response);
            setStatItems(response.data);
        } catch (err) {
            console.log("Error loading items: " + err);
        }
    }

    // Add to the db
    async function add() {
        try {
            if (dateField && opponentField && goalField && assistsField && shotField) {
                const newStatItem = {
                    date: dateField,
                    opponent: opponentField,
                    goals: goalField,
                    assists: assistsField,
                    shots: shotField
                };

                const response = await axios.post("http://localhost:3001/api/", newStatItem);

                // after user adds a row in the db, reset the text field
                setDateField("");
                setOpponentField("");
                setGoalField("");
                setAssistsField("");
                setShotField("");
                loadStats(); // Keeps frontend in sync
            }
        }
        catch (err) {
            console.log("Error adding item: " + err);
        }
    }

    // Edits a row of analytics i.e. goals/assists/shots etc
    async function edit(id) {
        if (!editMode) {
            try {
                const { data: toEdit } = await axios.get(`http://localhost:3001/api/${id}`);

                setDateField(toEdit.date);
                setOpponentField(toEdit.opponent);
                setGoalField(toEdit.goals);
                setAssistsField(toEdit.assists);
                setShotField(toEdit.shots);

                setEditId(id);
                setEditMode(true);
            } catch (err) {
                console.error("Error fetching stat item:", err);
            }
        } else {
            const updated = {
                date: dateField,
                opponent: opponentField,
                goals: goalField,
                assists: assistsField,
                shots: shotField
            };

            try {
                await axios.put(`http://localhost:3001/api/${id}`, updated);

                // same as add, reset the field
                setEditMode(false);
                setEditId(null);
                setDateField("");
                setOpponentField("");
                setGoalField("");
                setAssistsField("");
                setShotField("");

                loadStats(); // Keeps the frontend in sync
            } catch (err) {
                console.error("Error updating stat:", err);
            }
        }
    }


    // Delete an item
    async function deletion(statItemID) {
        try {
            await axios.delete("http://localhost:3001/api/" + statItemID); // deletes from sqlite database
            loadStats(); // Keeps frontend in sync
        }
        catch (err) {
            console.error("Error deleting item: ", err);
        }
    }

    // Deletes all from the db
    async function deleteAll() {
        try {
            await axios.delete("http://localhost:3001/api/");
            loadStats(); // keeps the frontend in sync
        }
        catch (err) {
            console.error("Error deleting all items: ", err);
        }
    }

    // Creates the edit and delete buttons for each item
    function actionButtons(itemID) {
        return (
            <View style={styles.iconsContainer}>
                <TouchableOpacity style={styles.icon} onPress={() => {
                    edit(itemID)
                }}>
                    <Icon name="edit" size={30}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deletion(itemID)}>
                    <Icon name="trash-alt" size={30}/>
                </TouchableOpacity>
            </View>
        )
    }

    const tableHead = ['Date', 'Opponent', 'Goals', 'Assists', 'Shots', 'Actions'];
    const tableData = statItems.map(sItem => ([
        sItem.date,
        sItem.opponent,
        sItem.goals,
        sItem.assists,
        sItem.shots,
        actionButtons(sItem.id)
    ]));
    const columnWidths = [130, 200, 80, 80, 80, 80];

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Puck Ledger</Text>
            <Text style={styles.textT}>Track your individual player stats!</Text>

            <ScrollView style={styles.tableContainer} horizontal={true}>
                <View>
                    <Table>
                        <Row
                            data={tableHead}
                            style={styles.head}
                            textStyle={styles.textT}
                            widthArr={columnWidths}
                        />
                    </Table>
                    <ScrollView>
                        <Table>
                            <Rows
                                data={tableData}
                                textStyle={styles.textT}
                                widthArr={columnWidths}
                            />
                        </Table>
                    </ScrollView>
                </View>
            </ScrollView>

            <View style={styles.inputContainer}>

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.txtInput}
                        value={dateField}
                        placeholder='Date'
                        placeholderTextColor='black'
                        onChangeText={setDateField} />
                    <TextInput
                        style={styles.txtInput}
                        value={opponentField}
                        placeholder='Opponent'
                        placeholderTextColor='black'
                        onChangeText={setOpponentField} />
                    <TextInput
                        style={styles.txtInput}
                        value={goalField}
                        placeholder='Goals'
                        placeholderTextColor='black'
                        onChangeText={setGoalField} />
                </View>

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.txtInput}
                        value={assistsField}
                        placeholder='Assists'
                        placeholderTextColor='black'
                        onChangeText={setAssistsField} />
                    <TextInput
                        style={styles.txtInput}
                        value={shotField}
                        placeholder='Shots'
                        placeholderTextColor='black'
                        onChangeText={setShotField} />
                    <Pressable style={styles.btn} onPress={() => {
                        editMode ? edit(editId) : add()
                    }}>
                        <Text style={styles.btnText}>
                            {!editMode ? ("Add") : ("Edit")}
                        </Text>
                    </Pressable>
                    <Pressable style={styles.btn} onPress={() => {
                        deleteAll()
                    }}>
                        <Text style={styles.btnText}>
                            Delete All
                        </Text>
                    </Pressable>
                </View>

            </View>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    tableContainer: {
        flex: 10,
        borderRadius: 8,
        borderWidth: 3,
        overflow: 'hidden',
        marginHorizontal: 12,
        maxWidth: 656,
        alignSelf: 'center'
    },
    inputContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    inputRow: {
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    head: {
        cornerRadius: 8,
        borderBottomWidth: 3,
    },
    textT: {
        margin: 6,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    txtInput: {
        flex: 3,
        marginRight: 20,
        borderWidth: 3,
        borderRadius: 5,
        fontSize: 20,
        height: 50,
        padding: 10,
    },
    btn: {
        borderWidth: 3,
        height: 50,
        justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 10
    },
    btnText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});