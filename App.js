import { StyleSheet, Text, View, Image, FlatList, SafeAreaView, Button, TouchableWithoutFeedback } from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import Colors from "./Themes/colors"
import { Pressable} from 'react-native';
import millisToMinutesAndSeconds from "./utils/millisToMinuteSeconds"




// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};


export default function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    const fetchTracks = async () => {
      // TODO: Comment out which one you don't want to use
      // myTopTracks or albumTracks

      const res = await myTopTracks(token);
      // const res = await albumTracks(ALBUM_ID, token);
      setTracks(res);
    };

    if (token) {
      // Authenticated, make API request
      fetchTracks();
    }
  }, [token]);

  // album image url, song title, song artists, album name, duration of song 
  const Song = ({imageUrl, title, artist, album, duration, trackNum }) => (
 
    <View style={styles.item}>
      <View style = {styles.box2} >
        <Text style = {styles.subtitle} > {trackNum} </Text>
    </View>
      <View style = {styles.box} >
      <Image style={styles.image} source={imageUrl}/>
      </View>
      <View style = {styles.box1} >
      <View style = {styles.info} >
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text style = {styles.subtitle}> {artist}</Text>
      </View>
      </View>
      <View style = {styles.box} >
        <Text numberOfLines={1} style = {styles.title}>{album}</Text>
      </View>
      <View style = {styles.box} >
        <Text style = {styles.subtitle}> {duration} </Text>
      </View>
    </View>
  );

  const renderItem = (item, index) => (
      <Song 
        trackNum = {index + 1}
        imageUrl = {item['album']['images'][2]}
        title = {item.name}
        artist = {item['album']['artists'][0]['name']}
        album = {item['album'].name}
        duration = {millisToMinutesAndSeconds(item.duration_ms)}
      />  
  );

  const SpotifyAuthButton = () => {
    return <View style={styles.text1}>
    <Pressable style={styles.button1}
          onPress={() => {
            promptAsync();
          }} > 
          <Image
            style={{
              height: 20,
              width: 20
            }}
            source = {require("./assets/spotify-logo.png")}
          />
          <Text style={styles.text1}> CONNECT WITH SPOTIFY </Text>
        </Pressable>
  </View>;
  };

  const SpotifyFlatList = () => {
    return <View style = {styles.container} >
      <View style = {styles.header} >
      <Image
            style={{
              height: 40,
              width: 40
            }}
            source = {require("./assets/spotify-logo.png")}
          />
      <Text style= {styles.headertitle}> My Top Tracks </Text>
      </View>
    <FlatList
        showsHorizontalScrollIndicator={false}
        data={tracks} // the array of data that the FlatList displays
        renderItem={({item, index}) => renderItem(item, index)} // function that renders each item
        keyExtractor={(item) => item.id} // unique key for each item
      />
    </View>
  };

  
  let contentDisplayed = null;

  if (token) {
    console.log("Working!"), // this has been entered so far! 
    console.log(tracks)
    contentDisplayed = <SpotifyFlatList/>
  } else {
    contentDisplayed = <SpotifyAuthButton/>
  }
 


  return (
    
    <SafeAreaView style={styles.container}>
      {/* TODO */}
      {contentDisplayed}
    </SafeAreaView>
    
    
    
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  rowItem: {
    display: "flex",
    flexDirection: "row",
  },
  text1: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  button1: {
    display: "flex",
    flexDirection: "row",
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 99999,
    elevation: 3,
    backgroundColor: Colors.spotify,
  },
  item: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
    marginVertical: 8,
  },
  box: {
    justifyContent: "center",
    width: 100,
    height: 100,
    padding: 10,
  },
  box1: {
    justifyContent: "center",
    width: 125,
    height: 100,
  },
  box2: {
    justifyContent: "center",
    width: 25,
    height: 100,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',

  },
  subtitle: {
    fontSize: 12,
    color: 'white',
  },
  
  info: {
    display: "flex",
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headertitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    
  },


});
