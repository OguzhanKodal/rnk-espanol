import { ScrollView, Text, View, Pressable, Alert, StyleSheet } from 'react-native';

const shelves = [
  { title: 'Corán', books: ['Corán', 'Significado en español'] },
  { title: 'Colección Risale-i Nur', books: ['Las Palabras', 'Las Cartas', 'Los Destellos', 'Los Rayos', 'Masnawi Nuriye'] },
  { title: 'Tratados breves', books: ['Ramadán, Frugalidad y Agradecimiento', 'Próximamente', 'Próximamente'] },
];
export default function Home() {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Biblioteca</Text>
    <Text style={styles.subtitle}>Risale-i Nur en español</Text>
    {shelves.map((shelf) => <View key={shelf.title} style={styles.shelf}>
      <Text style={styles.shelfTitle}>{shelf.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.books}>
        {shelf.books.map((book, i) => <Pressable key={`${book}-${i}`} accessibilityRole="button" onPress={() => Alert.alert('Próximamente')} style={[styles.book, { backgroundColor: ['#572b29', '#315045', '#533b2c', '#34445a'][i % 4] }]}>
          <View style={styles.border}><Text style={styles.bookText}>{book}</Text><Text style={styles.soon}>Próximamente</Text></View>
        </Pressable>)}
      </ScrollView><View style={styles.ledge} />
    </View>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ screen:{flex:1, backgroundColor:'#f7f1e7'},content:{paddingTop:65,paddingBottom:40},title:{fontSize:32,fontWeight:'700',color:'#392c24',marginHorizontal:22},subtitle:{fontSize:15,color:'#795e4c',marginHorizontal:22,marginBottom:20},shelf:{backgroundColor:'#a56f46',paddingTop:12,marginBottom:8},shelfTitle:{color:'#fff3dc',fontSize:17,fontWeight:'600',marginHorizontal:18},books:{paddingHorizontal:16,paddingTop:16,gap:12},book:{width:128,height:173,padding:7,borderRadius:3},border:{borderWidth:1,borderColor:'#cba968',flex:1,alignItems:'center',justifyContent:'center',padding:9},bookText:{color:'#f8e5b3',fontSize:15,fontFamily:'serif',textAlign:'center'},soon:{color:'#dec99d',fontSize:10,marginTop:12,textAlign:'center'},ledge:{height:16,backgroundColor:'#c28e5d',borderBottomWidth:5,borderBottomColor:'#795034'} });
