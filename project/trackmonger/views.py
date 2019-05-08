from django.shortcuts import render, redirect
from . import forms
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.urls import reverse
import urllib, requests
import base64
from bottle import route, run, request
import spotipy
from spotipy import oauth2
from urllib.parse import quote
import spotify_token as st
from django.http import JsonResponse
import json, os
from trackmonger.models import Playlist, Profile, Post
from trackmonger.forms import PlaylistForm, PlaylistUpdate, ProfileUpdate
from django.db import transaction
from spotipy.oauth2 import SpotifyClientCredentials
from django.contrib.auth import logout as django_logout
from django.contrib.auth.decorators import login_required
from django.utils import timezone
import dateutil.parser
from django.db.models import Q
from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder

import operator


# Create your views here.
class Song:
        def __init__(self, id, name, artist):
                self.id = id
                self.name = name + " - " + artist


def getToken(request):
        reply = {}
        user = User.objects.get(id=request.user.id)
        profile = Profile.objects.get(user=user)
        reply['token'] = profile.access_token
        return HttpResponse(json.dumps(reply), content_type='application/json')

def profile(request, id):
    context = {}
    context['user'] = request.user
    playlistUser = User.objects.get(id = id)
    if (request.user.id == id):
            context['myprofile'] = True
    else:
        context['myprofile'] = False
    if (request.method == 'GET'):
        context['profile'] = Profile.objects.get(user = User.objects.get(id = id))
        context['playlist'] = playlistUser.playlist_set.all()
    elif (request.method == 'POST'):
        currForm = ProfileUpdate(request.POST, request.FILES, instance = Profile.objects.get(user = User.objects.get(id = id)))
        if (currForm.is_valid()):
            currForm.save()
        context['profile'] = Profile.objects.get(user = User.objects.get(id = id))
        context['playlist'] = playlistUser.playlist_set.all()
    context['topartists'], context['topgenres'] = topGenres(playlistUser)
    context['following'] = playlistUser.following.all()
    return render(request, 'profile.html', context)

def topGenres(user):
    profile =Profile.objects.get(user = user)
    jsonDec = json.decoder.JSONDecoder()
    allArtists = jsonDec.decode(profile.artists)
    allGenres = jsonDec.decode(profile.genres)
    sortedArtists = sorted(allArtists.items(), key = operator.itemgetter(1), reverse = True)
    sortedGenres = sorted(allGenres.items(), key = operator.itemgetter(1), reverse = True)
    ar = []
    ge = []
    for i in range(min(5,len(sortedArtists))):
        ar.append(sortedArtists[i][0])
    for i in range(min(5,len(sortedGenres))):
        ge.append(sortedGenres[i][0])
    return (ar, ge)

def login_user(request):
        if request.method == "GET":
                context = {"form": forms.LoginForm()}
                return render(request, 'login.html', context)
        form = forms.LoginForm(request.POST)
        context = {"form": form}
        if not form.is_valid():
                return render(request, 'login.html', context)

        new_user = authenticate(username=form.cleaned_data['username'],
                                password=form.cleaned_data['password'])

        login(request, new_user)
        profile = Profile.objects.get(user=new_user)
        get_new_token(profile)
        return redirect(reverse('home'))

        

def register(request):

        context = {}
        if request.method == 'GET':
                context['form'] = forms.RegistrationForm()
                return render(request, 'register.html', context)

                form = RegistrationForm(request.POST)
                context['form'] = form

        # Validates the form.
        form = forms.RegistrationForm(request.POST)
        if not form.is_valid():
                context['form'] = form
                return render(request, 'register.html', context)

        # At this point, the form data is valid.  Register and login the user.
        new_user = User.objects.create_user(username=form.cleaned_data['username'], 
                password=form.cleaned_data['password'],
                email=form.cleaned_data['email'],
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'])

        new_user.save()

        new_user = authenticate(username=form.cleaned_data['username'],
                password=form.cleaned_data['password'])
        login(request, new_user)

        client_id = "413d044e2adc4845a009af65a9460727"
        redirect_uri = "https://34.238.50.153:443/spotifyLogin" 
        scopes = 'user-library-read streaming user-read-birthdate user-read-email user-read-private'
        state = 'user/' + str(new_user.id)

        return redirect('https://accounts.spotify.com/authorize' +
                '?response_type=code' +
                '&client_id=' + client_id +
                '&scope=' + quote(scopes, safe='') +
                '&state=' + state + 
                '&redirect_uri=' + quote(redirect_uri, safe=''))




def myprofile(request):
    return profile(request, request.user.id)

def spotifyLogin(request):
    client_id = "413d044e2adc4845a009af65a9460727"
    client_secret="f31a5fa1446a41a4ab6f6d3ad8f6157c"
    path = request.get_full_path()
    stateIndex = path.find("state")
    state = ''
    i = stateIndex + 13
    while i < len(path) and path[i].isdigit():
        state += path[i]
        i += 1
    code = request.get_full_path()[19:stateIndex - 1]


    post_data = {'grant_type': 'authorization_code', 'code': quote(code, safe=''), 'redirect_uri': "https://34.238.50.153:443/spotifyLogin", 'client_id': client_id, 'client_secret': client_secret}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post('https://accounts.spotify.com/api/token', data=post_data)
    content = dict(json.loads(response.text))
    access_token = content['access_token']
    user = User.objects.get(id=int(state))
    login(request, user)
    profile = Profile(user = user, access_token=access_token, refresh_token=content['refresh_token'], artists = json.dumps({}), genres = json.dumps({}))
    profile.save()
    return redirect(reverse('home'))


def get_new_token(profile):
    client_id = "413d044e2adc4845a009af65a9460727"
    client_secret="f31a5fa1446a41a4ab6f6d3ad8f6157c"
    post_data = {'grant_type': 'refresh_token', 'refresh_token': quote(profile.refresh_token, safe=''), 'client_id': client_id, 'client_secret': client_secret}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post('https://accounts.spotify.com/api/token', data=post_data)
    content = dict(json.loads(response.text))
    profile.access_token = content['access_token']
    profile.save()

@login_required
def home(request):

    currUser = User.objects.get(id=request.user.id)
    most_viewed_playlists = Playlist.objects.order_by('-views')[:5]
    similarPlaylists = commonPlaylists(request)
    similar = [{"user_id": p.user.id, "pk": p.pk, "name": p.name, "desc": "by " + p.user.username} for p in similarPlaylists]
    playlists = [{"user_id" :p.user.id, "pk": p.pk, "name": p.name, "desc": "by " + p.user.username} for p in most_viewed_playlists]
   
    context = {"trending_ps": playlists, "user": request.user, 'similar_ps' : similar}

    return render(request, "home.html", context)

def get_photo(request, id):
    item = Playlist.objects.get(pk = id)

    if not item.image:
        with open(MEDIA_ROOT+'adobestock.jpg', "rb") as f:
            return HttpResponse(f.read(), content_type = "image/jpeg")

    return HttpResponse(item.image)

def commonPlaylists(request):

    user = User.objects.get(id = request.user.id)
    profile = Profile.objects.get(user = user)
    allPlaylists = Playlist.objects.all()
    jsonDec = json.decoder.JSONDecoder()
    allArtists = jsonDec.decode(profile.artists)
    allGenres = jsonDec.decode(profile.genres)
    res = []
    for elem in allPlaylists:
        if (elem.artists and elem.genres):
            playlistArtists = jsonDec.decode(elem.artists)
            playlistGenres = jsonDec.decode(elem.genres)
            if (playlistArtists != [] and playlistGenres != []):
                playlistScore = getSimilarityScore(playlistArtists, playlistGenres, allArtists, allGenres)
                res.append((elem.pk, playlistScore))
    res.sort(key = lambda tup : tup[1], reverse = True)
    similarPlaylists = []
    for i in range(min(10,len(res))):
        similarPlaylists.append(Playlist.objects.get(pk = res[i][0]))
    return similarPlaylists


def getSimilarityScore(playlistArtists, playlistGenres, allArtists, allGenres):
    artistIntersect = set(playlistArtists.keys()) & set(allArtists.keys())
    genreIntersect = set(playlistGenres.keys()) & set(allGenres.keys())
    score = 0
    for elem in artistIntersect:
        score = score + allArtists[elem]
    for elem in genreIntersect:
        score = score + allGenres[elem]
    return score
def get_profileimage(request, id):
    item = Profile.objects.get(user = User.objects.get(id = id))

    # Maybe we don't need this check as form validation requires a picture be uploaded.
    # But someone could have delete the picture leaving the DB with a bad references.
    if not item.image:
        with open(MEDIA_ROOT+'nouser.jpg', "rb") as f:
            return HttpResponse(f.read(), content_type = "image/jpeg")

    return HttpResponse(item.image)
def getFollowers(id):
    playlist = Playlist.objects.get(pk = id)
    allFollowers = playlist.followers.all()
    return [x.id for x in allFollowers]

def getFollowing(id):
    user = User.objects.get(id = id)
    allPlaylists = user.following.all()
    return [x.pk for x in allPlaylists]

def getCollaborators(id):
    playlist = Playlist.objects.get(pk = id)
    allCollaborators = playlist.collaborators.all()
    return [x.id for x in allCollaborators]

def getCollaborating(id):
    user = User.objects.get(id = id)
    allPlaylists = playlist.collab.all()
    return [x.pk for x in allPlaylists]
@login_required
def playlist(request, id):
        playlist = Playlist.objects.get(pk=id)
        if request.user not in playlist.viewed_by.all():
            playlist.views += 1
            playlist.viewed_by.add(request.user)
            playlist.save()
        context = {"playlist": playlist, "user": request.user}
        if (request.user.id in getCollaborators(id)):
            context['isCollaborating'] = True
            context['isFollowing'] = False
        elif (request.user.id in getFollowers(id)):
            context['isFollowing'] = True
            context['isCollaborating'] = False
        else:
            context['isFollowing'] = False
            context['isCollaborating'] = False
        if request.method == "POST":
            currForm = PlaylistUpdate(request.POST, request.FILES, instance = playlist)
            if (currForm.is_valid()):
                currForm.save()

            play = Playlist.objects.get(pk = id)
            context['playlist'] = Playlist.objects.get(pk = id)


        return render(request, "playlist.html", context)

def search(request):
        reply = {}
        reply['results'] = []
        user = User.objects.get(id=request.user.id)
        profile = Profile.objects.get(user=user)
        access_token = profile.access_token
        sp = spotipy.Spotify(access_token)
        if request.GET['term']:
                results = sp.search(q=request.GET['term'], type="track", limit=10)
                for item in results['tracks']['items']:
                        # pretty(item)
                        name = item['name']
                        artist = item['artists'][0]['name']
                        id = item['uri']
                        url = item['album']['images'][0]['url']
                        song = {"name": name + " - " + artist, "id": id, "url":url}
                        reply['results'].append(song)

        return HttpResponse(json.dumps(reply), content_type='application/json')


def searchPeople(request):
    reply = {}
    reply['results'] = []
    currUser = User.objects.get(id=request.user.id)
    if request.GET['term']:
        users = User.objects.filter(username__startswith=request.GET['term'])
        for user in users:
            if user != currUser:
                userobj = {"username": user.username, "first_name": user.first_name, "last_name": user.last_name, "id": user.id}
                reply['results'].append(userobj)
    return HttpResponse(json.dumps(reply), content_type="application/json")

@transaction.atomic
def addSongs(request):
        user = User.objects.get(id=request.user.id)
        profile = Profile.objects.get(user=user)
        access_token = profile.access_token
        sp = spotipy.Spotify(access_token)

        track_ids = request.POST.getlist("ids[]")
        playlist_id = int(request.POST['playlist'][10:])
        playlist = Playlist.objects.get(pk=playlist_id)
        urls = {}
        urls["info"] = []
        jsonDec = json.decoder.JSONDecoder()
        songs = jsonDec.decode(playlist.songs)
        allArtists = jsonDec.decode(playlist.artists)
        allGenres = jsonDec.decode(playlist.genres)
        if track_ids:
                tracks = sp.tracks(track_ids)
                for track in tracks['tracks']:
                        artist = sp.artist(track['artists'][0]['external_urls']['spotify'])
                        # pretty(artist)
                        uri = track['uri']
                        present = False
                        for check in songs:
                            if check['uri'] == uri:
                                present = True
                                break
                        if present:
                            continue
                        name = track['name']
                        artists = ''
                        for artist in track['artists']:
                            currArtist = sp.artist(artist['external_urls']['spotify'])
                            for genre in currArtist['genres']:
                                    if genre in allGenres:
                                        allGenres[genre] = allGenres[genre] + 1
                                    else:
                                        allGenres[genre] = 1
                            if (artist['name'] in allArtists):
                                allArtists[artist['name']] = allArtists[artist['name']] + 1
                                
                            else:
                                allArtists[artist['name']] = 1

                            if artists == '':
                                artists += artist['name']
                            else:
                                artists += ', ' + artist['name']
                        image_url = track['album']['images'][0]['url']
                        info = {'uri': uri, 'name': name, 'artist': artists, 'image': image_url}
                        urls['info'].append(info)
                        songs.append(info)
        playlist.artists = json.dumps(allArtists)
        playlist.genres = json.dumps(allGenres)
        playlist.songs = json.dumps(songs)
        playlist.save()
        reply = json.dumps(urls)
        return HttpResponse(reply, content_type='application/json')

def addCollab(request):
    playlist_id = int(request.POST['playlist'][10:])
    playlist = Playlist.objects.get(pk=playlist_id)
    user_ids = request.POST.getlist("ids[]")
    for user_id in user_ids:
        playlist.collaborators.add(User.objects.get(id=user_id))
    return HttpResponse()


def createPlaylist(request):
        currUser = User.objects.get(id=request.user.id)
        newPlaylist = Playlist(user=currUser, name="", desc="", songs=json.dumps([]), artists = json.dumps({}), genres = json.dumps({}))
        newPlaylist.save()
        newPlaylist.collaborators.add(currUser)
        newPlaylist.save()
        return redirect("playlist", id=newPlaylist.pk)

def createProper(request):
    currUser = User.objects.get(id = request.user.id)
    playlist = Playlist(user=currUser, name="", desc="", songs=json.dumps([]), artists = json.dumps({}), genres = json.dumps({}))
    playlist.save()
    playlist.collaborators.add(currUser)
    playlist.save()
    currForm = PlaylistUpdate(request.POST, request.FILES, instance = playlist)
    if (currForm.is_valid()):
        currForm.save()
    if playlist.name == "":
        playlist.name = "My New Playlist"
        playlist.save()
    if request.POST['content'] != "":
        post = Post(created_by=currUser, creation_time=timezone.now(), content=request.POST['content'], playlist=playlist)
        post.save()
    
    return redirect("playlist", id = playlist.pk)

def getSongs(request):
        if request.GET['playlist']:
                playlist_id = int(request.GET['playlist'][10:])
                playlist = Playlist.objects.get(pk=playlist_id)
                urls = {}
                if (request.user.id in getCollaborators(playlist_id)):
                        urls["isCollaborating"] = True
                else:
                        urls["isCollaborating"] = False
                urls["info"] = []
                jsonDec = json.decoder.JSONDecoder()
                songs = jsonDec.decode(playlist.songs)
                for song in songs:
                    urls["info"].append(song)
        reply = json.dumps(urls)
        return HttpResponse(reply, content_type='application/json')

@transaction.atomic
def upVote(request):
    if request.POST['playlist']:   
        playlist = Playlist.objects.get(pk=int(request.POST['playlist'][10:]))
        currUser = User.objects.get(id=request.user.id)
        if currUser in playlist.upVotedBy.all():
            pass
        elif currUser in playlist.downVotedBy.all():
            playlist.upVotes += 1
            playlist.downVotes -= 1
            playlist.upVotedBy.add(currUser)
            playlist.downVotedBy.remove(currUser)
        else:
            playlist.upVotes += 1
            playlist.upVotedBy.add(currUser)
        votes = {}
        votes["upvote"] = playlist.upVotes
        votes["downvote"] = playlist.downVotes
        playlist.save()
        reply = json.dumps(votes)
        return HttpResponse(reply, content_type='application/json')

@transaction.atomic
def unfollowPlaylist(request):
    if request.POST['playlist']:
        playlist = Playlist.objects.get(pk = int(request.POST['playlist'][10:]))
        currUser = User.objects.get(id=request.user.id)
        playlist.followers.remove(currUser)
        context = {}
        context["con"] = "<button type = 'button' style = 'background-color: Transparent; border: None' onClick = 'followClicked()'><i class='fas fa-plus fa-2x' style = 'color:white;'></i></button>"
        reply = json.dumps(context)
        return HttpResponse(reply, content_type = 'application/json')

@transaction.atomic
def followPlaylist(request):
    if request.POST['playlist']:
        playlist = Playlist.objects.get(pk = int(request.POST['playlist'][10:]))
        currUser = User.objects.get(id = request.user.id)
        playlist.followers.add(currUser)
        content = {}
        content["con"] = "<button type = 'button' style = 'background-color: Transparent; border: None' onClick = 'unfollowClicked()'><i class='fas fa-minus fa-2x' style = 'color:white;'></i></button>"
        reply = json.dumps(content)
        return HttpResponse(reply, content_type = 'application/json')
        
@transaction.atomic
def downVote(request):
    if request.POST['playlist']:   
        playlist = Playlist.objects.get(pk=int(request.POST['playlist'][10:]))
        currUser = User.objects.get(id=request.user.id)
        
        if currUser in playlist.downVotedBy.all():
            pass
        elif currUser in playlist.upVotedBy.all():
            playlist.upVotes -= 1
            playlist.downVotes += 1
            playlist.upVotedBy.remove(currUser)
            playlist.downVotedBy.add(currUser)
        else:
            playlist.downVotes += 1
            playlist.downVotedBy.add(currUser)
        votes = {}
        votes["upvote"] = playlist.upVotes
        votes["downvote"] = playlist.downVotes
        playlist.save()
        reply = json.dumps(votes)
        return HttpResponse(reply, content_type='application/json')

def getVotes(request):
    if request.GET['playlist']:
        playlist_id = int(request.GET['playlist'][10:])
        playlist = Playlist.objects.get(pk=playlist_id)
        votes = {}
        votes["upvote"] = playlist.upVotes
        votes["downvote"] = playlist.downVotes
        reply = json.dumps(votes)
        return HttpResponse(reply, content_type='application/json')

def getViews(request):
    if request.GET['playlist']:
        playlist_id = int(request.GET['playlist'][10:])
        playlist = Playlist.objects.get(pk=playlist_id)
        votes = {}
        votes["views"] = playlist.views
        reply = json.dumps(votes)
        return HttpResponse(reply, content_type='application/json')

def addArtistGenre(request):
    if (request.POST['songPlaying']):
        user = User.objects.get(id=request.user.id)
        profile = Profile.objects.get(user=user)
        access_token = profile.access_token
        sp = spotipy.Spotify(access_token)
        playlist_id = int(request.POST['playlist'][10:])
        playlist = Playlist.objects.get(pk=playlist_id)
        jsonDec = json.decoder.JSONDecoder()
        allArtists = jsonDec.decode(profile.artists)
        allGenres = jsonDec.decode(profile.genres)
        track = sp.tracks([request.POST['songPlaying']])
        track = track['tracks'][0]
        for artist in track['artists']:
            currArtist = sp.artist(artist['external_urls']['spotify'])
            for genre in currArtist['genres']:
                    if genre in allGenres:
                        allGenres[genre] = allGenres[genre] + 1
                    else:
                        allGenres[genre] = 1
            if (artist['name'] in allArtists):
                allArtists[artist['name']] = allArtists[artist['name']] + 1
                
            else:
                allArtists[artist['name']] = 1
        profile.artists = json.dumps(allArtists)
        profile.genres = json.dumps(allGenres)
        profile.save()
        reply = json.dumps([])
        return HttpResponse(reply, content_type='application/json')


@transaction.atomic
def deleteSong(request):
        if request.GET['track']:
                user = User.objects.get(id=request.user.id)
                profile = Profile.objects.get(user=user)
                access_token = profile.access_token
                sp = spotipy.Spotify(access_token)
                playlist_id = int(request.GET['playlist'][10:])
                collab = getCollaborators(playlist_id)
                if request.user.id not in collab:
                    return HttpResponse()

                playlist = Playlist.objects.get(pk=playlist_id)
                jsonDec = json.decoder.JSONDecoder()
                songs = jsonDec.decode(playlist.songs)
                allArtists = jsonDec.decode(playlist.artists)
                allGenres = jsonDec.decode(playlist.genres)
                remove = None
                for song in songs:
                    if song['uri'] == request.GET['track']:
                        remove = song
                        break
                if remove:
                    track = sp.tracks([song['uri']])
                    pretty(track['tracks'][0])
                    track = track['tracks'][0]
                    
                    for artist in track['artists']:
                        currArtist = sp.artist(artist['external_urls']['spotify'])
                        if currArtist['name'] in allArtists:
                            allArtists[currArtist['name']] = allArtists[currArtist['name']] - 1
                            if (allArtists[currArtist['name']] == 0):
                                del allArtists[currArtist['name']]
                            for genre in currArtist['genres']:
                                if (genre in allGenres):
                                    allGenres[genre] = allGenres[genre] - 1
                                if (allGenres[genre] == 0):
                                    del allGenres[genre]
                    songs.remove(song)
                playlist.songs = json.dumps(songs)
                playlist.artists = json.dumps(allArtists)
                playlist.genres = json.dumps(allGenres)
                playlist.save()
        return HttpResponse()

@transaction.atomic
def changedOrder(request):
    user = User.objects.get(id=request.user.id)
    profile = Profile.objects.get(user=user)
    playlist_id = int(request.POST['playlist'][10:])
    collab = getCollaborators(playlist_id)
    if request.user.id not in collab:
        return HttpResponse(json.dumps({"val":collab}))
    playlist = Playlist.objects.get(pk=playlist_id)
    track_ids = request.POST.getlist('order[]')
    access_token = profile.access_token
    sp = spotipy.Spotify(access_token)
    tracks = sp.tracks(track_ids)
    songs = []
    for track in tracks['tracks']:
            uri = track['uri']
            name = track['name']
            artists = ''
            for artist in track['artists']:
                if artists == '':
                    artists += artist['name']
                else:
                    artists += ', ' + artist['name']
            image_url = track['album']['images'][0]['url']
            info = {'uri': uri, 'name': name, 'artist': artists, 'image': image_url}
            songs.append(info)
    playlist.songs = json.dumps(songs)
    playlist.save()
    return HttpResponse(json.dumps({"val":collab}))

def getPosts(request):
    date = dateutil.parser.parse(request.GET['date'])
    result = {}
    result['posts'] = []
    allPosts = Post.objects.filter(Q(creation_time__gte=date))
    for post in allPosts:
        profile = Profile.objects.get(user=post.created_by)
        postObj = {"user_id": profile.user.id, "name":post.created_by.first_name + " " + post.created_by.last_name, "profile_id": profile.pk, 
        "content": post.content, "time":post.creation_time, "playlist_id": post.playlist.pk, "playlist_name": post.playlist.name, "upvotes":post.playlist.upVotes, "downvotes": post.playlist.downVotes}
        result['posts'].append(postObj)
    reply = json.dumps(result, cls=DjangoJSONEncoder)
    return HttpResponse(reply, content_type='application/json')

@transaction.atomic
def updateCurrentSong(request):
    user = User.objects.get(id=request.user.id)
    profile = Profile.objects.get(user=user)
    playlist_id = int(request.POST['playlist'][10:])
    playlist = Playlist.objects.get(pk=playlist_id)
    profile.currPlaylist = playlist.pk
    profile.currSong = request.POST['uri']
    profile.timePlayed = request.POST['sliderVal']
    profile.play = request.POST['status']
    profile.save()
    return HttpResponse()


@transaction.atomic
def getCurrentSong(request):
    user = User.objects.get(id=request.user.id)
    profile = Profile.objects.get(user=user)
    data = {'uri': profile.currSong, 'time': profile.timePlayed, 'currPlaylist': "/playlist/" + str(profile.currPlaylist), 'state':profile.play}
    reply = json.dumps(data)
    return HttpResponse(reply, content_type='application/json')


def pretty(d, indent=0):
   for key, value in d.items():
      print('\t' * indent + str(key))
      if isinstance(value, dict):
         pretty(value, indent+1)
      else:
         print('\t' * (indent+1) + str(value))

@login_required
def logout(request):
    django_logout(request)
    return redirect(reverse('login'))



