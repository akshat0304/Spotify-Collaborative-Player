from django.urls import path 
from . import views

urlpatterns = [
    path("", views.login_user, name = "login"),
    path("register", views.register, name="register"),
    path('playlist/<int:id>', views.playlist, name="playlist"),
    path("playlist/searchSongs", views.search, name="searchSongs"),
    path("playlist/addSongs", views.addSongs, name="addSongs"), 
    path("playlist/getSongs", views.getSongs, name="getSongs"),
    path("playlist/getToken", views.getToken, name="getToken"), 
    path("playlist/searchPeople", views.searchPeople, name="getPeople"),
    path("searchPeople", views.searchPeople, name="searchPeople"),
    path("home", views.home, name="home"),
    path("playlist/deleteSong", views.deleteSong, name="deleteSong"),
    path("createPlaylist", views.createPlaylist, name="createPlaylist"), 
    path("playlist/changedOrder", views.changedOrder, name="changedOrder"), 
    path("playlist/addCollab", views.addCollab, name="addCollab"),
    path("spotifyLogin", views.spotifyLogin, name="yo"),
    path('photo/<int:id>', views.get_photo, name = "photo"),
    path('profile/<int:id>', views.profile, name = "profile"),
    path('myprofile', views.myprofile, name = "myprofile"),
    path('profileimage/<int:id>', views.get_profileimage, name = "profileimage"), 
    path('logout', views.logout, name="logout"),
    path('createproper', views.createProper, name = "createproper"),
    path('playlist/upVotePlaylist', views.upVote, name="upVote"),
    path('playlist/downVotePlaylist', views.downVote, name="downVote"),
    path("playlist/getVotes", views.getVotes, name="getVotes"),
    path('playlist/unfollowPlaylist', views.unfollowPlaylist, name = "unfollowPlaylist"),
    path('playlist/followPlaylist', views.followPlaylist, name = "followPlaylist"), 
    path('getPosts', views.getPosts, name="getPosts"),
    path("playlist/getViews", views.getViews, name="getViews"),
    path("playlist/currentSong", views.updateCurrentSong, name="currentSong"),
    path("getCurrentSong", views.getCurrentSong, name="getCurrSong"),
    path("getToken", views.getToken, name="getToken"), 
    path("playlist/getCurrentSong", views.getCurrentSong, name="getCurrSong"),
    path("playlist/addArtistGenre", views.addArtistGenre, name="addArtistGenre"),
    path("currentSong", views.updateCurrentSong, name="currentSong"),
    path("profile/getCurrentSong", views.getCurrentSong, name="currentSong"),
    path("profile/getToken", views.getToken, name="getToken"), 
    path("profile/currentSong", views.updateCurrentSong, name="currentSong"),
    path("profile/getSongs", views.getSongs, name="getSongs"),
    path("getSongs", views.getSongs, name="getSongs"),




]
