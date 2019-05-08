from django.db import models
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from finalproject.settings import *


# Create your models here.

class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    name = models.CharField(max_length=100, default = 'My Playlist')
    desc = models.CharField(max_length=500, default = 'Songs I am listening to right now')
    image = models.ImageField(upload_to = '', default = MEDIA_ROOT + 'adobestock.jpg')
    songs = models.TextField()
    collaborators = models.ManyToManyField(User, related_name="collab")
    followers = models.ManyToManyField(User, related_name = "following")
    views = models.IntegerField(default=0)
    viewed_by = models.ManyToManyField(User, related_name="viewed")
    upVotes = models.IntegerField(default=0)
    downVotes = models.IntegerField(default=0)
    artists = models.TextField(default="")
    genres = models.TextField(default="")
    upVotedBy = models.ManyToManyField(User, related_name="upvote")
    downVotedBy = models.ManyToManyField(User, related_name="downvote")



class Profile(models.Model):
    access_token = models.CharField(max_length=400)
    refresh_token = models.CharField(max_length=400)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to = '', default = MEDIA_ROOT+'nouser.jpg')
    currPlaylist = models.IntegerField(default=0)
    currSong = models.CharField(max_length=200, default="")
    timePlayed = models.FloatField(default=0.0)
    play = models.BooleanField(default=False)
    artists = models.TextField(default="")
    genres = models.TextField(default="") 


class Post(models.Model):
    content = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="entry_creators")
    creation_time = models.DateTimeField()
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="playlistname")
    





