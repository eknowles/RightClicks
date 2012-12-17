#!/usr/bin/perl
#use strict;

my $dirName = 'extractTest';

use vars qw( $opt_j );
use Archive::Zip qw(:ERROR_CODES);
use Getopt::Std;
 my $now = localtime time;
		 print "\n\nEPUB CHECKS \n";
		 
		 print "--------------------------------------\n";
		 print "--------------------------------------\n";
	     print "".$now."\n";
		
		 print "--------------------------------------\n";
		 print "--------------------------------------\n";

 @files = <*>;
 foreach $file (@files) {
	 my $ext = ($file =~ m/([^.]+)$/)[0];
	 print "\n";
	 if ($ext eq "epub"){
		 my $zip = Archive::Zip->new();
         my $zipName = $file;
		 my $status = $zip->read( $zipName );
		 my $memberName = "OEBPS/content.opf";
		 $zip->extractMember($memberName);
		 open BOOK, "< OEBPS/content.opf";
		 my ($title) = "Unknown";
		 my ($author) = "Unknown";
		 my ($sigil) = "OK";
		 while (my $line = <BOOK>){
		#	print $line;
			if ($line =~ m/<dc:title>(.*)<\/dc:title>/){
			 $title = $1;
			#print $1;
			}
			if ($line =~ m/<dc:creator opf:role="aut">(.*)<\/dc:creator>/){
				 $author = $1;
			 }
			if ($line =~ m/<meta content="(.*)" name="Sigil version" \/>/){
				 $sigil = "FAILED! CHECK META DATA!";
			 }
		 }
		 
		 $title =~ s/&amp;/&/;
 		 $author =~ s/&amp;/&/;
		 
		 close BOOK;
		 system('del OEBPS /Q');
		 print "Author:\t\t".$author."\n";
		 print "Title:\t\t".$title."\n";
		 print "File:\t\t".$file."\n\n";
		 print "Legacy:\t\t".$sigil."\n";
		 print "--------------------------------------\n";
		 system("C:\\RightClicks\\epubchecknopuase.bat \"".$file."\"");
		 print "\n\n--------------------------------------\n\n";
	 }
 } 
 
		 system('del OEBPS /Q');